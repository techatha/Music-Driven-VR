AFRAME.registerComponent('water-ripple', {
    schema: {
        color: { type: 'color', default: '#aaccff' },
        scale: { type: 'number', default: 1 },
        ratio: { type: 'number', default: 1 },
        autoFit: { type: 'boolean', default: true } // New: Enable auto-fitting
    },

    init: function () {
        this.ripple = document.createElement('a-circle');
        this.el.appendChild(this.ripple);

        if (this.data.autoFit) {
            // Wait for model to load to calculate bounds
            this.el.addEventListener('model-loaded', this.fitToModel.bind(this));
            // Also try immediately in case it's already loaded (rare but possible)
            if (this.el.getObject3D('mesh')) this.fitToModel();
        } else {
            // Manual setup
            this.setupRipple(this.data.scale, this.data.ratio);
        }
    },

    fitToModel: function () {
        const mesh = this.el.getObject3D('mesh') || this.el.object3D;
        if (!mesh) return;

        // Calculate Bounding Box
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Size.x is Width, Size.z is Length (Depth)
        // Add a little padding (e.g. 20% bigger) so the ripple starts outside the object
        const width = size.x * 1.2;
        const length = size.z * 1.2;

        // Determine Scale and Ratio
        // Base scale (radius) is half the width
        // We use Math.max to ensure we cover the object
        // Actually, let's use the logic: scale = width/2 (since radius 1 * scale = radius)
        // But our ring is radius 1. So scale should be radius.

        let finalScale = width / 2;

        // Ratio = Length / Width
        let ratio = length / width;

        // Safety check to avoid zero or infinity
        if (width === 0) width = 1;
        if (finalScale === 0) finalScale = 1;
        if (!ratio || ratio === Infinity) ratio = 1;

        console.log(`[WaterRipple] Auto-fit: Size=${width.toFixed(2)}x${length.toFixed(2)}, Ratio=${ratio.toFixed(2)}`);

        this.setupRipple(finalScale, ratio);
    },

    setupRipple: function (s, ratio) {
        const ripple = this.ripple;

        ripple.setAttribute('color', this.data.color);
        ripple.setAttribute('radius', '1'); // Base radius is 1, scaled by 's'
        ripple.setAttribute('rotation', '-90 0 0'); // Flat on water
        ripple.setAttribute('position', '0 0.5 0'); // Raised slightly to avoid water clipping

        // Apply visual adjustments
        // Base Scale
        const startX = s;
        const startY = s * ratio;

        // Target Scale (Grow)
        const endX = s * 1.5;
        const endY = (s * ratio) * 1.5;

        // Breathing Animation (Scale)
        ripple.setAttribute('animation', {
            property: 'scale',
            from: `${startX} ${startY} 1`,
            to: `${endX} ${endY} 1`,
            dur: 3000,
            dir: 'alternate', // Grow and Shrink
            loop: true,
            easing: 'easeInOutSine'
        });

        // Opacity Animation (Pulse)
        // Since it's filled, maximum opacity should be lower to be transparent/subtle
        ripple.setAttribute('animation__fade', {
            property: 'opacity',
            from: '0.4', // Lower initial opacity for filled shape
            to: '0.1',
            dur: 3000,
            dir: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    }
});
