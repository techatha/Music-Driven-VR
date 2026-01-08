// layoutResolver.js
export function resolveFootprint(size, rotationY, layoutAxis = 'z') {
  const rot = ((rotationY % 360) + 360) % 360;
  const swap = rot === 90 || rot === 270;

  if (layoutAxis === 'z') {
    return {
      depth: swap ? size.x : size.z,
      width: swap ? size.z : size.x
    };
  }

  if (layoutAxis === 'x') {
    return {
      depth: swap ? size.z : size.x,
      width: swap ? size.x : size.z
    };
  }
}
