AFRAME.registerComponent('water-ripple', {
    schema: {
        color: { type: 'color', default: '#dbe9ffff' },
        scale: { type: 'number', default: 1 }
    },

    init: function () {
        // Create a ring entity for the ripple
        const ripple = document.createElement('a-ring');

        // Initial setup
        ripple.setAttribute('color', this.data.color);
        ripple.setAttribute('radius-inner', '0.5'); // Start small
        ripple.setAttribute('radius-outer', '1');   // Start small
        ripple.setAttribute('rotation', '-90 0 0'); // Flat on water

        // Position slightly above water to avoid z-fighting, but below boat
        ripple.setAttribute('position', '0 0.1 0');

        // Add animation for expanding (Ripple effect)
        ripple.setAttribute('animation', {
            property: 'scale',
            from: '1 1 1',
            to: '5 5 5',
            dur: 2000,
            loop: true,
            easing: 'easeOutQuad'
        });

        // Add animation for fading out
        ripple.setAttribute('animation__fade', {
            property: 'opacity',
            from: '0.8',
            to: '0',
            dur: 2000,
            loop: true,
            easing: 'easeOutQuad'
        });

        // Apply visual adjustments based on component scale schema if needed
        // For now, we rely on the main entity's position. 
        // If the main entity is huge (boat is 15x), this ring might need to be HUGE.
        ripple.setAttribute('scale', `${this.data.scale} ${this.data.scale} ${this.data.scale}`);

        this.el.appendChild(ripple);
    }
});
