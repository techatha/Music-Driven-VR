AFRAME.registerComponent('model-color', {
    schema: {
        color: { type: 'color', default: '#FFFFFF' }
    },

    init: function () {
        this.el.addEventListener('model-loaded', this.update.bind(this));
    },

    update: function () {
        const mesh = this.el.getObject3D('mesh');
        if (!mesh) return;

        mesh.traverse((node) => {
            if (node.isMesh) {
                node.material.color.set(this.data.color);
            }
        });
    }
});
