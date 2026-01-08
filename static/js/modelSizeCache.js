// modelSizeCache.js
export const MODEL_CACHE = {};

export function measureModel(el, modelUrl, callback) {
  if (MODEL_CACHE[modelUrl]) {
    callback(MODEL_CACHE[modelUrl]);
    return;
  }

  el.addEventListener('model-loaded', () => {
    const THREE = AFRAME.THREE;
    const mesh = el.getObject3D('mesh');

    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);

    MODEL_CACHE[modelUrl] = {
      x: size.x,
      y: size.y,
      z: size.z
    };

    callback(MODEL_CACHE[modelUrl]);
  });
}
