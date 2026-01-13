AFRAME.registerComponent('procedural-sunset', {
    schema: {
        preset: { type: 'string', default: 'arches' }, // 'arches' has a nice orange sunset vibe by default
        skyType: { type: 'string', default: 'atmosphere' },
        lighting: { type: 'string', default: 'distant' },
        ground: { type: 'string', default: 'none' } // We have our own ocean plane
    },

    init: function () {
        // We rely on aframe-environment-component being loaded.
        // We will configure it to look like a sunset.

        const envData = {
            preset: this.data.preset,
            skyType: this.data.skyType,
            lighting: this.data.lighting,
            ground: this.data.ground,

            // Customized for Sunset
            horizonColor: '#ff9900',
            skyColor: '#331133',
            dressing: 'none', // No trees/mushrooms/etc generated
            fog: 0.02         // Add some depth
        };

        this.el.setAttribute('environment', envData);

        this.el.setAttribute('scale', '5 5 5');

        // Manually adjust sun position if needed via the environment component parameters
        // environment component usually handles this via 'lightPosition'
        this.el.setAttribute('environment', 'lightPosition', '-1 2 -5'); // Low sun
    }
});
