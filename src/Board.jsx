import Square from './Square';

export default function Board({ size, positions, conflicts = new Set(), onSquareClick, onSquareRightClick, disabled = false, small = false }) {
  return (
    <div className={`board ${small ? 'small-board' : ''}`}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, '--size': size }}
      role="group" aria-label={`${size} by ${size} chessboard`}>
      {Array.from({ length: size * size }, (_, index) => {
        const row =Math.floor(index / size), col = index % size;
        const piece = positions.find((item) => item.row === row && item.col === col);
        return <Square key={index} row={row} col={col} piece={piece}
          conflict={conflicts.has(`${row}-${col}`)} disabled={disabled}
          onClick={onSquareClick ? () => onSquareClick(row, col) : undefined}
          onRightClick={onSquareRightClick ? () => onSquareRightClick(row, col) : undefined} />;
      })}
    </div>
  );
}
