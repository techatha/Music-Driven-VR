AFRAME.registerComponent('ship-y-controller', {
    schema: {
        // No custom position/scale needed, use entity attributes
    },

    init: function () {
        this.createShip();
        // this.animateFloating(); // Disabled as per user request to keep ship still
    },

    createShip: function () {
        const ship = document.createElement('a-entity');

        // Load the Ship Y model
        ship.setAttribute('gltf-model', 'url(static/assets/3Dmodels/ship_y/scene.gltf)');

        // Reset rotation if needed to face forward. 
        ship.setAttribute('rotation', '0 0 0');

        this.el.appendChild(ship);
        this.shipEntity = ship;
        console.log("Ship Y created");
    },

    animateFloating: function () {
        if (!this.shipEntity) return;

        // Animate relative to the parent entity's position (local 0)
        // Reduced amplitude for less "wobble" and slower duration
        this.shipEntity.setAttribute('animation', {
            property: 'position.y',
            dir: 'alternate',
            dur: 8000,
            easing: 'easeInOutSine',
            loop: true,
            to: 0.1,
            from: -0.1
        });

        // Rolling/Pitching
        // Drastically reduced angles (0.2 degrees) and slower duration (10s)
        this.shipEntity.setAttribute('animation__roll', {
            property: 'rotation',
            dir: 'alternate',
            dur: 10000,
            easing: 'easeInOutSine',
            loop: true,
            to: '0.2 0 0.1',
            from: '-0.2 0 -0.1'
        });
    }
});
