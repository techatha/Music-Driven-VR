import { measureModel } from '../modelSizeCache.js';
import { resolveFootprint } from '../layoutResolver.js';

AFRAME.registerComponent('city-block', {
    schema: {
        width: { type: 'number', default: 20 },
        depth: { type: 'number', default: 40 },
        padding: { type: 'number', default: 1 },
        min: { type: 'number', default: 3 },
        max: { type: 'number', default: 6 }
    },

    init() {
        this.placeEdge('left');
        this.placeEdge('right');
    },

    placeEdge(side) {
        const THREE = AFRAME.THREE;

        const buildingModels = [
            '#building01',
            '#building02',
            '#building03',
            '#building05',
            '#building06'
        ];

        const isLeft = side === 'left';
        const edgeStart = -this.data.depth / 2;
        const edgeEnd = this.data.depth / 2;

        let cursor = edgeStart;

        const spawnNext = () => {
            if (cursor >= edgeEnd) return;

            const modelUrl =
                buildingModels[Math.floor(Math.random() * buildingModels.length)];

            const scale = THREE.MathUtils.randFloat(this.data.min, this.data.max);

            const b = document.createElement('a-entity');
            b.setAttribute('gltf-model', modelUrl);
            b.setAttribute('scale', `${scale} ${scale * 2} ${scale}`);
            b.setAttribute('rotation', `0 ${isLeft ? 90 : -90} 0`);

            this.el.appendChild(b);

            measureModel(b, modelUrl, size => {
                const { depth, width } =
                    resolveFootprint(size, isLeft ? 90 : -90, 'z');

                const x =
                    (isLeft ? -1 : 1) *
                    (this.data.width / 2 + width / 2 + this.data.padding);

                const z = cursor + depth / 2;

                b.setAttribute('position', { x, y: 0, z });

                cursor += depth + this.data.padding;
                spawnNext(); // 🔁 chain safely
            });
        };

        spawnNext(); // 🚀 START THE CHAIN
    }
});
