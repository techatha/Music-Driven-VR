AFRAME.registerComponent('urban-environments', {
    schema: {
        active: { default: true }
    },

    init: function () {
        // Create elements container
        this.container = document.createElement('a-entity');
        this.el.appendChild(this.container);

        // 1. Ground Plane (Asphalt)
        const ground = document.createElement('a-plane');
        ground.setAttribute('rotation', '-90 0 0');
        ground.setAttribute('width', '100');
        ground.setAttribute('height', '100');
        ground.setAttribute('color', '#111');
        ground.setAttribute('roughness', '1');
        this.container.appendChild(ground);

        // 2. Road Plane
        const road = document.createElement('a-plane');
        road.setAttribute('position', '0 0.01 0');
        road.setAttribute('rotation', '-90 0 0');
        road.setAttribute('width', '8');
        road.setAttribute('height', '100');
        road.setAttribute('color', '#222');
        this.container.appendChild(road);

        // 3. Road Markings (Center Line)
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
            // We could reset fog here if needed, but for now just hide the geometry
            this.container.setAttribute('visible', false);
            // Clean up fog if we wanted to be thorough, but it might affect other scene settings.
            // For this specific preset usage, we usually just want to enable it.
        }
    }
});
