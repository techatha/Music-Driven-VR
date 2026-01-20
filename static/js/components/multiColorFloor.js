AFRAME.registerComponent('multi-color-floor', {
    schema: {
        preset: { type: 'string', default: 'none' }, // 'glass', 'snow', 'none', 'custom'
        color: { type: 'color', default: '#000' }
    },

    init: function () {
        this.el.addEventListener('set-floor-glass', () => this.setGlass());
        this.el.addEventListener('set-floor-snow', () => this.setSnow());
        this.el.addEventListener('set-floor-void', () => this.setVoid());
        this.el.addEventListener('set-floor-custom', (e) => {
            const color = e.detail.color || this.data.color;
            this.setCustom(color);
        });

        // Apply initial preset
        if (this.data.preset === 'glass') this.setGlass();
        else if (this.data.preset === 'snow') this.setSnow();
        else if (this.data.preset === 'custom') this.setCustom(this.data.color);
        else this.setVoid(); // Default to 'none'
    },

    setGlass: function () {
        console.log("Floor: Setting Glass");
        this.el.setAttribute('material', {
            shader: 'standard',
            color: '#00FF00',
            opacity: 0.3,
            transparent: true,
            roughness: 0.1,
            metalness: 0.1,
            side: 'double'
        });
    },

    setSnow: function () {
        console.log("Floor: Setting Snow");
        this.el.setAttribute('material', {
            shader: 'flat',     // Flat ignores lighting (no yellow tint from morning sun)
            color: '#FFFFFF',
            opacity: 1.0,
            transparent: false, // Ensure it's opaque
            side: 'double'
        });
    },

    setVoid: function () {
        console.log("Floor: Setting Void");
        this.el.setAttribute('material', {
            shader: 'flat',
            color: '#000000',
            opacity: 1.0,
            transparent: false, // Ensure it's opaque
            side: 'double'
        });
    },

    setCustom: function (color) {
        console.log(`Floor: Setting Custom Color ${color}`);
        this.el.setAttribute('material', {
            shader: 'standard',
            color: color,
            opacity: 1.0,
            transparent: false, // Default to opaque for custom
            roughness: 1.0,    // High roughness = less reflection
            side: 'double'
        });
    }
});
