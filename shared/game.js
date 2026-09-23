export const PIECES = {
  queen: { name: 'Queen', symbol: '♛', rule: 'Rows, columns, and diagonals' },
  rook: { name: 'Rook', symbol: '♜', rule: 'Rows and columns' },
  bishop: { name: 'Bishop', symbol: '♝', rule: 'Diagonals' },
  knight: { name: 'Knight', symbol: '♞', rule: 'An L: two squares, then one across' },
  king: { name: 'King', symbol: '♚', rule: 'One square in any direction' },
};

export function attacks(from, to) {
  const dr = Math.abs(from.row - to.row);
  const dc = Math.abs(from.col - to.col);
  if (dr === 0 && dc === 0) return true;
  if (from.type === 'queen') return dr === 0 || dc === 0 || dr === dc;
  if (from.type === 'rook') return dr === 0 || dc === 0;
  if (from.type === 'bishop') return dr === dc;
  if (from.type === 'knight') return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
  if (from.type === 'king') return dr <= 1 && dc <= 1;
  return false;
}

export function conflictKeys(positions) {
  const keys = new Set();
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (attacks(positions[i], positions[j]) || attacks(positions[j], positions[i])) {
        keys.add(`${positions[i].row}-${positions[i].col}`);
        keys.add(`${positions[j].row}-${positions[j].col}`);
      }
    }
  }
  return keys;
}

export function validateSolution(level, positions) {
  if (!Array.isArray(positions) || positions.length !== level.pieces.length) {
    return 'Place every piece in the tray.';
  }
  const required = {};
  for (const type of level.pieces) required[type] = (required[type] || 0) + 1;
  const occupied = new Set();
  for (const piece of positions) {
    if (!piece || typeof piece.type !== 'string' || !Object.hasOwn(PIECES, piece.type) ||
      !Number.isInteger(piece.row) || !Number.isInteger(piece.col) ||
      piece.row < 0 || piece.row >= level.size || piece.col < 0 || piece.col >= level.size) {
      return 'Every piece must have a valid type and a square inside the board.';
    }
    const key = `${piece.row}-${piece.col}`;
    if (occupied.has(key)) return 'Two pieces cannot share a square.';
    occupied.add(key);
    if (!required[piece.type]) return 'Use exactly the pieces assigned to this puzzle.';
    required[piece.type]--;
  }
  if (conflictKeys(positions).size) return 'Some pieces attack each other.';
  return null;
}

export function formatTime(ms) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function pieceSummary(pieces) {
  return Object.entries(PIECES).filter(([type]) => pieces.includes(type))
    .map(([type, info]) => `${pieces.filter((piece) => piece === type).length} ${info.name.toLowerCase()}${pieces.filter((piece) => piece === type).length > 1 ? 's' : ''}`)
    .join(' · ');
}
