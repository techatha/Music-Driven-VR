AFRAME.registerComponent('boat-controller', {
    schema: {},
    init: function () {
        this.createBoat();
        this.animateFloating();
    },

    createBoat: function () {
        // Create a wrapper for the boat visual
        const boatVisual = document.createElement('a-entity');

        // 1. Main Hull (Simple Box for now)
        // User can replace this with a GLB model later: 
        // boatVisual.setAttribute('gltf-model', 'url(...)');
        const hull = document.createElement('a-box');
        hull.setAttribute('color', '#5D4037'); // Wood color
        hull.setAttribute('depth', 6);
        hull.setAttribute('height', 0.5);
        hull.setAttribute('width', 2.5);
        hull.setAttribute('position', '0 0.25 0');
        hull.setAttribute('material', 'roughness: 1');

        // 2. Simple "Lantern" on the boat for light
        const boatLight = document.createElement('a-entity');
        boatLight.setAttribute('geometry', 'primitive: cylinder; radius: 0.1; height: 0.3');
        boatLight.setAttribute('material', 'color: #ff9; emissive: #ff9; emissiveIntensity: 2');
        boatLight.setAttribute('position', '0 1 -2.5'); // Front of boat

        // Point light from lantern
        const light = document.createElement('a-light');
        light.setAttribute('type', 'point');
        light.setAttribute('intensity', '0.8');
        light.setAttribute('distance', '10');
        light.setAttribute('color', '#ffaa00');
        light.setAttribute('position', '0 0 0');
        boatLight.appendChild(light);

        boatVisual.appendChild(hull);
        boatVisual.appendChild(boatLight);

        this.el.appendChild(boatVisual);
    },

    animateFloating: function () {
        // Simple sine wave bobbing
        // We use the animation component directly on the entity for simplicity
        this.el.setAttribute('animation', {
            property: 'position',
            dir: 'alternate',
            dur: 3000,
            easing: 'easeInOutSine',
            loop: true,
            to: '0 0.2 0', // Float up slightly
            from: '0 -0.1 0' // Float down slightly
        });

        this.el.setAttribute('animation__roll', {
            property: 'rotation',
            dir: 'alternate',
            dur: 5000,
            easing: 'easeInOutSine',
            loop: true,
            to: '1 0 2', // Slight roll
            from: '-1 0 -1'
        });
    }
});
