import { useEffect, useRef, useState } from 'react';
import Board from './Board';
import PastRuns from './PastRuns';
import RunGallery from './RunGallery';
import { request } from './api';
import { PIECES, conflictKeys, formatTime, validateSolution } from '../shared/game';
import './App.css';

const SESSION_KEY = 'queens-circuit-run';
function storedRun() {
  try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
}
function rememberRun(id) {
  try { sessionStorage.setItem(SESSION_KEY, id); } catch {}
}

const PROGRESS_ICONS = ['♟', '♞', '♝', '♜', '♛', '♚'];
function progressIcon(index, total) {
  return PROGRESS_ICONS[Math.round(index * (PROGRESS_ICONS.length - 1) / Math.max(1, total - 1))];
}

export default function App() {
  const [tab, setTab] = useState('play');
  const [run, setRun] = useState(null);
  const [positions, setPositions] = useState([]);
  const [preferred, setPreferred] = useState('queen');
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState('');
  const [resumeError, setResumeError] = useState('');
  const [clock, setClock] = useState(() => Date.now());
  const [clockOffset, setClockOffset] = useState(0);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const pendingStartId = useRef(null);
  const submitting = useRef(false);
  const quits = useRef(0);

  const levelIndex = run?.solutions.length || 0;
  const playing = run?.status === 'playing';
  const level = playing ? run.levels[levelIndex] : null;
  const conflicts = conflictKeys(positions);
  const solved = level && validateSolution(level, positions) === null;
  const remainingOf = (type) => level.pieces.filter((piece) => piece === type).length
    - positions.filter((piece) => piece.type === type).length;
  const selected = level ? [preferred, ...level.pieces].find((type) => remainingOf(type) > 0) ?? preferred : preferred;
  const elapsed = run ? run.durationMs ?? Math.max(0, clock + clockOffset - run.startedAt) : 0;

  useEffect(() => {
    let active = true;
    async function restore() {
      setRestoring(true);
      setResumeError('');
      const id = storedRun();
      if (!id) { setRestoring(false); return; }
      try {
        const data = await request(`/api/runs/${id}`);
        if (!active) return;
        if (data.run.status === 'cancelled') {
          sessionStorage.removeItem(SESSION_KEY);
          return;
        }
        setRun(data.run);
        setClockOffset(data.serverNow - Date.now());
        setClock(Date.now());
      } catch (failure) {
        if (active) setResumeError(failure.message);
      } finally {
        if (active) setRestoring(false);
      }
    }
    restore();
    return () => { active = false; };
  }, [restoreAttempt]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setClock(Date.now()), 250);
    return () => clearInterval(timer);
  }, [playing]);

  async function startRun() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    pendingStartId.current ||= crypto.randomUUID();
    try {
      const data = await request('/api/runs', {
        method: 'POST', body: JSON.stringify({ id: pendingStartId.current }),
      });
      setRun(data.run);
      rememberRun(data.run.id);
      setPositions([]);
      setClockOffset(data.serverNow - Date.now());
      setClock(Date.now());
      setResumeError('');
      pendingStartId.current = null;
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }

  async function submitSolution(solution) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    const quitsBefore =quits.current;
    try {
      const data = await request(`/api/runs/${run.id}/solutions`, {
        method: 'POST', body: JSON.stringify({ levelIndex, positions: solution }),
      });
      if (quits.current !== quitsBefore) return; 
      setRun(data.run);
      setClockOffset(data.serverNow - Date.now());
      setClock(Date.now());
      setPositions([]);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }

  function quit() {
    quits.current++;
    if (run && run.status !== 'completed') {
      request(`/api/runs/${run.id}`, { method: 'DELETE' }).catch(() => {});
    }
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setRun(null);
    setPositions([]);
    setTab('play');
    setError('');
    setResumeError('');
    pendingStartId.current = null;
  }

  function clickSquare(row, col) {
    if (busy || submitting.current || !level) return;
    setError('');
    const existing = positions.find((piece) => piece.row === row && piece.col === col);
    if (existing) return;
    if (remainingOf(selected) <= 0) return;
    const next = [...positions, { type: selected, row, col }];
    setPositions(next);
    if (validateSolution(level, next) === null) submitSolution(next);
  }

  function removePiece(row, col) {
    if (busy || submitting.current || !level) return;
    setError('');
    setPositions(positions.filter((piece) => piece.row !== row || piece.col !== col));
  }

  return <main className="app">
    <nav className="tabs" aria-label="Main navigation">
      <button aria-current={tab === 'play' ? 'page' : undefined} onClick={() => { setTab('play'); setError(''); }}>Play</button>
      <button aria-current={tab === 'history' ? 'page' : undefined} onClick={() => { setTab('history'); setError(''); }}>Past Runs</button>
    </nav>

    {tab === 'history' ? <PastRuns /> : <>
      {restoring ? <p role="status">Loading your run…</p> : <>
        {resumeError && <div className="error" role="alert">Could not restore your previous run: {resumeError}
          <button className="secondary" onClick={() => setRestoreAttempt(restoreAttempt + 1)}>Retry loading</button>
        </div>}
        {!run && <section className="welcome">
          <h1>Eight Queens<small>(but the board gets progressively larger and also there are random pieces)</small></h1>
          <div className="title-board"><Board size={8} positions={[]} /></div>
          <button className="primary" disabled={busy} onClick={startRun}>{busy ? 'Starting…' : 'Start run'}</button>
        </section>}


        {level && <section>
          <ol className="progress" aria-label="Puzzle progress"
            style={{ gridTemplateColumns: `repeat(${run.levels.length}, 1fr)` }}>{run.levels.map((item, index) =>
            <li key={item.number} className={index < levelIndex ? 'done' : index === levelIndex ? 'current' : ''}
              aria-current={index === levelIndex ? 'step' : undefined}>
              <span aria-hidden="true">{progressIcon(index, run.levels.length)}</span><small>Puzzle {item.number}</small>
            </li>)}</ol>
          <div className="game-layout">
            <div>
              <div className="section-heading"><h2>Puzzle {level.number}</h2></div>
              <Board size={level.size} positions={positions} conflicts={conflicts} onSquareClick={clickSquare}
                onSquareRightClick={removePiece} disabled={busy} />
              <div className="board-footer">
                <span>{positions.length} / {level.pieces.length} pieces placed</span>
                <div className="board-side">
                  <strong className="timer" aria-label={`Run time ${formatTime(elapsed)}`}>{formatTime(elapsed)}</strong>
                  <button className="secondary board-button" disabled={busy || positions.length === 0}
                    onClick={() => { setPositions([]); setError(''); }}>Clear board</button>
                  <button className="secondary board-button" onClick={quit}>Quit</button>
                </div>
              </div>
            </div>
            <aside className="game-sidebar">
              <h3>Pieces</h3>
              <div className="piece-tray">{Object.entries(PIECES).filter(([type]) => level.pieces.includes(type)).map(([type, info]) => {
                const total = level.pieces.filter((piece) => piece === type).length;
                const remaining = total - positions.filter((piece) => piece.type === type).length;
                return <button key={type} className={`piece-choice ${selected === type ? 'selected' : ''}`}
                  aria-pressed={selected === type} disabled={busy || remaining === 0} onClick={() => setPreferred(type)}>
                  <span className="piece-symbol" aria-hidden="true">{info.symbol}</span><span><strong>{info.name}</strong><small>{remaining} of {total} left</small></span><span className="choice-dot" /></button>;
              })}</div>
              <p className="instruction">Place all pieces
                <a className="info-button" href="https://www.chess.com/terms/chess-pieces" target="_blank" rel="noreferrer"
                  aria-label="How the pieces move (opens chess.com)" title="How the pieces move">i</a></p>
              <p className="hint">Left click to place, right click to remove</p>
              {busy &&<p className="status" role="status">Saving…</p>}
              {solved && !busy && error && <button className="primary" onClick={() => submitSolution(positions)}>Retry saving solution</button>}
            </aside>
          </div>
        </section>}

        {run?.status === 'completed' && <section>
          <div className="completion"><h2>Run complete</h2><p>Time: <strong>{formatTime(run.durationMs)}</strong></p>
            <div className="completion-actions">
              <button className="primary" disabled={busy} onClick={startRun}>{busy ? 'Starting…' : 'New run'}</button>
              <button className="secondary board-button" onClick={quit}>Quit</button>
            </div></div>
          <RunGallery run={run} />
        </section>}
      </>}
    </>}
    {error && <p className="error" role="alert">{error}</p>}
  </main>;
}
