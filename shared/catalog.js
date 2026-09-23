const Q = 'queen', R = 'rook', B = 'bishop', N = 'knight', K = 'king';

export const LEVELS = [
  { number: 1, name: '', size: 4, sets: [
    [R, R, B], [R, B, B], [R, B, N], [R, R, N], [B, N, N],
    [B, B, K], [R, N, K], [N, N, K],
  ] },
  { number: 2, name: '', size: 5, sets: [
    [Q, R, B, B], [Q, R, R, N], [Q, Q, B, N], [Q, R, B, N], [Q, B, N, N],
    [Q, N, N, K], [R, R, B, K], [Q, B, B, K],
  ] },
  { number: 3, name: '', size: 6, sets: [
    [Q, Q, Q, R, N], [Q, Q, R, R, B], [Q, Q, R, B, B],
    [Q, Q, Q, B, N], [Q, Q, R, N, N],
    [Q, R, B, N, K], [Q, Q, N, N, K], [R, R, B, B, N],
  ] },
  { number: 4, name: '', size: 7, sets: [
    [Q, Q, Q, Q, Q, R], [Q, Q, Q, Q, R, R], [Q, Q, Q, Q, R, B],
    [Q, Q, Q, Q, B, N], [Q, Q, Q, R, R, N],
    [Q, Q, Q, R, B, K], [Q, Q, R, R, N, K], [Q, Q, R, B, N, N],
  ] },
  { number: 5, name: '', size: 8, sets: [
    [Q, Q, Q, Q, Q, Q, Q, Q], [Q, Q, Q, Q, Q, Q, Q, R],
    [Q, Q, Q, Q, Q, Q, Q, B], [Q, Q, Q, Q, Q, Q, Q, N],
    [Q, Q, Q, Q, Q, Q, R, R],
    [Q, Q, Q, Q, Q, R, B, K], [Q, Q, Q, Q, R, R, N, K], [Q, Q, Q, Q, Q, B, N, N],
  ] },
  { number: 6, name: '', size: 9, sets: [
    [Q, Q, R, R, R, B, B, B, N, N, K, K], [Q, Q, Q, R, R, B, B, N, N, N, K, K],
    [Q, R, R, R, B, B, B, B, N, N, N, K, K], [Q, Q, R, R, B, B, B, N, N, N, N, K, K],
    [R, R, R, R, B, B, B, N, N, N, K, K, K], [Q, Q, R, R, R, B, B, N, N, N, K, K, K],
    [Q, R, R, R, R, B, B, B, N, N, K, K, K], [Q, Q, Q, R, R, B, B, B, N, N, N, K, K],
  ] },
];

export function pickLevels(random = Math.random) {
  return LEVELS.map((level) => {
    const variant = Math.floor(random() *level.sets.length);
    return { number: level.number, name: level.name, size: level.size,
      variant: variant + 1, pieces: [...level.sets[variant]] };
  });
}
