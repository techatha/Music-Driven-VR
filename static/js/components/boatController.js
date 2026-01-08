AFRAME.registerComponent('boat-controller', {
    schema: {
        color: { type: 'color', default: '#FFFFFF' }
    },
    init: function () {
        this.createBoat();
        this.animateFloating();
    },

    createBoat: function () {
        // Create a wrapper for the boat visual
        const boatVisual = document.createElement('a-entity');

        // Load the GLTF Model
        boatVisual.setAttribute(
            'gltf-model',
            'url(static/assets/3Dmodels/river_boat/scene_fixed.gltf)'
        );

        // Use the generic component to tint the model
        boatVisual.setAttribute('model-color', 'color', this.data.color);


        // Adjust scale/rotation (trial and error)
        // Reduced significantly to 0.001 based on user feedback
        boatVisual.setAttribute('scale', '15 15 15');
        boatVisual.setAttribute('rotation', '0 90 0');
        boatVisual.setAttribute('position', '0 0 0');

        // Add a lantern light on the boat itself
        const boatLight = document.createElement('a-light');
        boatLight.setAttribute('type', 'point');
        boatLight.setAttribute('intensity', '0.6');
        boatLight.setAttribute('distance', '8');
        boatLight.setAttribute('color', '#ffaa00');
        boatLight.setAttribute('position', '0 1 0'); // Centered light
        boatVisual.appendChild(boatLight);

        this.el.appendChild(boatVisual);

        console.log("Boat created");
    },

    animateFloating: function () {
        // Simple sine wave bobbing
        this.el.setAttribute('animation', {
            property: 'position',
            dir: 'alternate',
            dur: 3000,
            easing: 'easeInOutSine',
            loop: true,
            to: '0 0.2 0',
            from: '0 -0.1 0'
        });

        this.el.setAttribute('animation__roll', {
            property: 'rotation',
            dir: 'alternate',
            dur: 5000,
            easing: 'easeInOutSine',
            loop: true,
            to: '1 0 2',
            from: '-1 0 -1'
        });
    }
});
