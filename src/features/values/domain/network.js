export const NETWORK_POSITIONS = [[0.25, 0.19], [0.76, 0.24], [0.19, 0.5], [0.81, 0.56], [0.29, 0.8], [0.71, 0.84]]
export const MOBILE_POSITIONS = [[0.25, 0.43], [0.75, 0.43], [0.25, 0.66], [0.75, 0.66], [0.25, 0.88], [0.75, 0.88]]
export const NETWORK_EDGES = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [0, 5], [1, 4]]
export function confine(value, extent, size) {
  const inset = Math.min(extent / 2, size / 2 + 10)
  return Math.max(inset, Math.min(extent - inset, value))
}
export function spring(position, velocity, target, dt) {
  const nextVelocity = (velocity + (target - position) * 42 * dt) * Math.exp(-8 * dt)
  return [position + nextVelocity * dt, nextVelocity]
}
