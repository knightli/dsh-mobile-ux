// No DOM or host dependencies. Progress remains unbounded after arming.
export function calculatePullState(distance, previous = null, threshold = 108) {
  if (!Number.isFinite(threshold) || threshold <= 0) throw new TypeError('Invalid pull threshold');
  const value = Number.isFinite(distance) ? Math.max(0, distance) : 0;
  const direction = !previous ? 0 : Math.sign(value - previous.distance) || previous.direction;
  return {
    distance: value,
    progress: value / threshold,
    direction,
    reversing: direction < 0,
    phase: value === 0 ? 'hidden' : value >= threshold ? 'armed' : 'pulling',
    overdrag: Math.max(0, value / threshold - 1.6),
  };
}
