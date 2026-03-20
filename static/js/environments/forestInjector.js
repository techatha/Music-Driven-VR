function injectForestEnvironment(rootElement, presetString = "") {
    const isBoat = presetString.toLowerCase().includes('boat');

    rootElement.innerHTML = `
        <!-- Moon (Keep existing) -->
        <a-entity id="moon" gltf-model="url(/static/assets/3Dmodels/moon/scene_fixed.gltf)"
            position="50 150 -150" scale="1 1 1" moon-controller>
        </a-entity>

        <!-- Environment -->
        <a-entity sky-controller></a-entity>
        <a-sky
            material="shader: gradient-shader; topColor: #020205; bottomColor: #050510; offset: 400; exponent: 0.6"></a-sky>
        <a-entity star-system="count: 5000; radius: 400; color: #FFF"></a-entity>

        <!-- Forest (Background) -->
        <a-entity
            forest-generator="count: 40; treeModel: url(/static/assets/3Dmodels/pine_tree_fixed.glb); autoStart: true">
        </a-entity>

        ${isBoat ? `
        <!-- NEW: Water Surface (Parent for draining animation) -->
        <a-entity water-helper="width: 1000; height: 1000" position="0 -20 0">
            <!-- Boat Nested Inside to sink with Water -->
            <a-entity id="boat" boat-controller="color: #00FF00" water-ripple position="0 0 0">
                <!-- Decoration can go here, but NOT the camera -->
            </a-entity>
        </a-entity>` : ''}

        <a-entity lanterns="count: 100; range: 200; speed: 0.8; color: #ffaa00"></a-entity>

        <!-- Particles (Leaves) -->
        <a-entity custom-particles="type: none; count: 12000; color: #66cc66" position="0 15 0"></a-entity>

        <!-- Player Camera -->
        <a-entity ${isBoat ? 'camera-controller="target: #boat; offset: 0 1.6 0.5; copyRotationY: true"' : ''} position="0 1.6 0"
            rotation="0 180 0">
            <a-camera look-controls wasd-controls="fly: false"></a-camera>
        </a-entity>

        <!-- Lighting -->
        <a-entity scene-lighting="preset: forest"></a-entity>
        
        <!-- Local Lantern Warmth & Floor Illumination -->
        <a-light type="point" position="0 5 0" color="#ffaa00" intensity="0.5" distance="50"></a-light>
        <a-light type="point" position="0 2 0" color="#ffffff" intensity="0.4" distance="20"></a-light>

        <!-- Floor -->
        <a-plane position="0 -5 0" rotation="-90 0 0" width="1000" height="1000"
            multi-color-floor="preset: none"></a-plane>
    `;

    // Execute scripts that were inside the HTML
    setTimeout(() => {
        const forest = document.querySelector('[forest-generator]');
        const moon = document.querySelector('#moon');

        // Trigger Moon Growth
        setTimeout(() => {
            if (moon) moon.emit('start-growth');
        }, 1000);

        // Trigger Forest Growth
        setTimeout(() => {
            if (forest) forest.emit('start-growth');
        }, 500);

        if (isBoat) {
            const lanterns = document.querySelector('[lanterns]');
            const water = document.querySelector('[water-helper]');

            setTimeout(() => {
                console.log("Starting Lanterns and Water Rise...");
                if (lanterns) lanterns.emit('start-lanterns'); // Activate lantern logic
                if (water) water.emit('start-fill');           // Rise up
            }, 1000); // 1 second after load to rise up!
        }
    }, 100);
    // Slight delay to ensure elements are in the DOM
}
