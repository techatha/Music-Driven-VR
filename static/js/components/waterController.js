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

        // Sanitize inputs
        const w = parseFloat(data.width) || 500;
        const h = parseFloat(data.height) || 500;

        // Create the water plane as a CHILD entity
        // This allows us to animate the PARENT (this.el) freely without messing up the rotation
        const waterPlane = document.createElement('a-entity');
        waterPlane.setAttribute('geometry', {
            primitive: 'plane',
            width: w,
            height: h
        });
        waterPlane.setAttribute('rotation', '-90 0 0'); // Flat
        waterPlane.setAttribute('material', {
            shader: 'flat',
            color: '#3e96e9',
            opacity: 0.8,
            transparent: true,
            side: 'double'
        });

        el.appendChild(waterPlane);

        // Animation: Drain
        this.el.addEventListener('start-drain', () => {
            console.log("Starting Water/Boat Drain...");
            el.setAttribute('animation__drain', {
                property: 'position.y',
                to: -20,
                dur: 5000,
                easing: 'easeInOutQuad'
            });
        });

        // Animation: Fill (Rise)
        this.el.addEventListener('start-fill', () => {
            console.log("Starting Water/Boat Rise...");
            el.setAttribute('animation__fill', {
                property: 'position.y',
                to: 0,
                dur: 5000,
                easing: 'easeInOutQuad'
            });
        });
    }
});
