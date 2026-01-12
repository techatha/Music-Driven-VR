import { measureModel } from '../modelSizeCache.js';
import { resolveFootprint } from '../layoutResolver.js';

AFRAME.registerComponent('street-lights', {
    schema: {
        width: { type: 'number', default: 20 },   // Match this to your city-block width
        depth: { type: 'number', default: 100 },  // Match this to your city-block depth
        interval: { type: 'number', default: 20 }, // Distance between lights
        scale: { type: 'number', default: 0.03 },  // <--- REDUCED SCALE (Try 0.05 if still too big)
        padding: { type: 'number', default: 1 }    // Distance from the road edge
    },

    init() {
        this.placeEdge('left');
        this.placeEdge('right');
    },

    placeEdge(side) {
        const isLeft = side === 'left';

        // Ensure we cover the exact same length as the city block
        const startZ = -this.data.depth / 2;
        const endZ = this.data.depth / 2;

        let cursor = startZ;

        const spawnNext = () => {
            if (cursor >= endZ) return;

            const modelUrl = '#street-light';

            const el = document.createElement('a-entity');
            el.setAttribute('gltf-model', modelUrl);

            // Apply the smaller scale immediately
            const s = this.data.scale;
            el.setAttribute('scale', `${s} ${s} ${s}`);

            // Face the road: Left side = 90, Right side = -90
            el.setAttribute('rotation', `0 ${isLeft ? 90 : -90} 0`);

            this.el.appendChild(el);

            measureModel(el, modelUrl, size => {
                // We use measureModel to ensure we don't sink it into the ground,
                // but we ignore the width for X-placement to ensure they line up straight.

                // X Position: Road Half Width + Fixed Padding
                // This keeps them on the "curb" line, regardless of how fat the model is.
                const xOffset = (this.data.width / 2) + this.data.padding;
                const x = isLeft ? -xOffset : xOffset;

                el.setAttribute('position', { x: x, y: 0, z: cursor });

                // Move cursor by fixed interval (Space them out evenly)
                cursor += this.data.interval;

                spawnNext();
            });
        };

        spawnNext();
    }
});
