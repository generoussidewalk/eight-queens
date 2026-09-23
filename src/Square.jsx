import { PIECES } from '../shared/game';


export default function Square({ row, col, piece, conflict, onClick, onRightClick, disabled }) {
  const label = `Row ${row + 1}, column ${col + 1}, ${piece ? PIECES[piece.type].name : 'empty'}${conflict ? ', in conflict' : ''}`;
  const className = `square ${(row + col) % 2 ? 'dark' : 'light'} ${conflict ? 'conflict' : ''}`;
  const symbol = piece ? PIECES[piece.type].symbol : '';
  if (!onClick) return <span className={className} aria-label={label} title={label}>{symbol}</span>;
  return <button type="button" className={className} aria-label={label}
    aria-pressed={Boolean(piece)} disabled={disabled} onClick={onClick}
    onContextMenu={onRightClick ? (event) => { event.preventDefault(); if (piece) onRightClick(); } : undefined}>
    <span aria-hidden="true">{symbol}</span>
  </button>;
}
