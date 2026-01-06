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
        const buildingModels = [
            '#building01',
            '#building02',
            '#building03',
            '#building05',
            '#building06'
        ];

        const isLeft = side === 'left';
        const edgeLength = this.data.depth;
        let cursor = -edgeLength / 2;

        while (cursor < edgeLength / 2) {
            const size = THREE.MathUtils.randFloat(this.data.min, this.data.max);
            if (cursor + size > edgeLength / 2) break;

            const b = document.createElement('a-entity');

            const x =
                (isLeft ? -1 : 1) *
                (this.data.width / 2 + size / 2 + this.data.padding);

            const z = cursor + size / 2;

            b.setAttribute('position', { x, y: 0, z });
            b.setAttribute('scale', `${size} ${size * 2} ${size}`);
            b.setAttribute('rotation', `0 ${isLeft ? 90 : -90} 0`);

            const modelUrl =
                buildingModels[Math.floor(Math.random() * buildingModels.length)];
            b.setAttribute('gltf-model', modelUrl);
            

            this.el.appendChild(b);

            cursor += size + this.data.padding;
        }
    }
});
