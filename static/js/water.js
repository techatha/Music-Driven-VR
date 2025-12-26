AFRAME.registerComponent('water-helper', {
    schema: {
        width: { type: 'number', default: 500 },
        height: { type: 'number', default: 500 },
        color: { type: 'color', default: '#e93e3eff' } // Dark deep blue
    },
    init: function () {
        console.log("Water component init. Data:", this.schema);
        const el = this.el;
        const data = this.schema;

        // Sanitize inputs to avoid NaN
        const w = parseFloat(data.width) || 500;
        const h = parseFloat(data.height) || 500;

        console.log(`Creating Water Plane: ${w}x${h}`);

        // Create the water plane
        el.setAttribute('geometry', {
            primitive: 'plane',
            width: w,
            height: h
        });

        el.setAttribute('rotation', '-90 0 0'); // Flat on the ground/water level

        // Use Flat shader first to guarantee visibility, then we can upgrade to standard/physical
        el.setAttribute('material', {
            shader: 'flat',
            color: '#3e96e9', // Nice Blue
            opacity: 0.8,
            transparent: true,
            side: 'double'
        });

        // Add a simple animation to "breathe" or move slightly (optional)
        // For actual waves, a shader is better, but a simple texture scroll or color shift works for stylized
        // For now, static beautiful reflective water is better than ugly moving water
    }
});
