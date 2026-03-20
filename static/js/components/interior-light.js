/**
 * Interior Lighting Isolation Component
 * 
 * Prevents the global "Sky" and "Sun" directional lights from illuminating
 * the interior furniture and walls of the Room environment.
 * 
 * It places the targeted entity (and its children) onto a specific 3D Layer (Layer 1).
 * Then, it configures local lights to only illuminate Layer 1, while the global
 * scene lights (Layer 0) will ignore these objects.
 */

// 1. Component to apply to walls, furniture, floor, etc.
AFRAME.registerComponent('interior-object', {
    init: function () {
        this.el.addEventListener('model-loaded', () => this.applyLayer());
        // Apply immediately for non-models (like a-box walls)
        this.applyLayer();
    },

    applyLayer: function () {
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.traverse((node) => {
                if (node.isMesh) {
                    node.layers.enable(1); // Enable Layer 1 (Interior Light)
                    node.layers.disable(0); // Disable Layer 0 (Global Sun Light)
                }
            });
        }
    }
});

// 2. Component to apply to lights that should only affect the interior
AFRAME.registerComponent('interior-light', {
    init: function () {
        const light = this.el.getObject3D('light');
        if (light) {
            light.layers.enable(1); // Illuminate Layer 1
            light.layers.disable(0); // Do NOT illuminate Layer 0 (Outside)
        }
    }
});
