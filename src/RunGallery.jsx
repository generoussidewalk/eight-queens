import Board from './Board';
import { formatTime, pieceSummary } from '../shared/game';

export default function RunGallery({ run }) {
  return (
    <article className="run-card">
      <div className="run-heading">
        <div><p className="eyebrow">COMPLETED RUN</p>
          <h3>{new Date(run.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</h3>
        </div>
        <strong className="run-time">{formatTime(run.durationMs)}</strong>
      </div>
      <div className="gallery">
        {run.solutions.map((solution) => {
          const level = run.levels[solution.levelIndex];
          return <figure key={solution.levelIndex}>
            <figcaption><strong>Puzzle {level.number}</strong><span>{level.size} × {level.size}</span></figcaption>
            <Board size={level.size} positions={solution.positions} small />
            <p className="piece-caption">{pieceSummary(level.pieces)}</p>
          </figure>;
        })}
      </div>
    </article>
  );
}
