AFRAME.registerComponent('urban-road', {
    schema: {
        active: { default: true }
    },

    init: function () {
        // Create elements container
        this.container = document.createElement('a-entity');
        this.el.appendChild(this.container);

        // 1. Road Plane (sits above the multi-color-floor)
        const road = document.createElement('a-plane');
        road.setAttribute('position', '0 0.02 0');
        road.setAttribute('rotation', '-90 0 0');
        road.setAttribute('width', '8');
        road.setAttribute('height', '100');
        road.setAttribute('color', '#222');
        this.container.appendChild(road);

        // 2. Road Markings (Center Line)
        const markingsContainer = document.createElement('a-entity');
        markingsContainer.setAttribute('position', '0 0 0.01');
        road.appendChild(markingsContainer);

        const stripe = document.createElement('a-plane');
        stripe.setAttribute('width', '0.2');
        stripe.setAttribute('height', '100');
        stripe.setAttribute('color', 'yellow');
        stripe.setAttribute('emissive', 'yellow');
        stripe.setAttribute('emissive-intensity', '0.5');
        markingsContainer.appendChild(stripe);
    },

    update: function () {
        const scene = this.el.sceneEl;
        if (this.data.active) {
            // Set Fog
            scene.setAttribute('fog', {
                type: 'linear',
                color: '#101015',
                near: 10,
                far: 50,
                density: 0.02
            });
            scene.setAttribute('background', 'color', '#050505');
            this.container.setAttribute('visible', true);
        } else {
            this.container.setAttribute('visible', false);
        }
    }
});

