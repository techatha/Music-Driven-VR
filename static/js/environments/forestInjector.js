function injectForestEnvironment(rootElement) {
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

        <!-- NEW: Water Surface (Parent for draining animation) -->
        <a-entity water-helper="width: 1000; height: 1000" position="0 -20 0">
            <!-- Boat Nested Inside to sink with Water -->
            <a-entity id="boat" boat-controller="color: #00FF00" water-ripple position="0 0 0">
                <!-- Decoration can go here, but NOT the camera -->
            </a-entity>
        </a-entity>

        <a-entity lanterns="count: 100; range: 200; speed: 0.8; color: #ffaa00"></a-entity>

        <!-- Player Camera -->
        <a-entity camera-controller="target: #boat; offset: 0 1.6 0.5; copyRotationY: true" position="0 1.6 0"
            rotation="0 180 0">
            <a-camera look-controls wasd-controls="fly: false"></a-camera>
        </a-entity>

        <!-- Lighting -->
        <a-light type="ambient" color="#222"></a-light>
        <!-- Moonlight -->
        <a-light type="directional" position="20 50 -20" color="#aaccff" intensity="0.6"></a-light>
        <!-- Lantern Warmth -->
        <a-light type="point" position="0 5 0" color="#ffaa00" intensity="0.5" distance="50"></a-light>

        <!-- Floor -->
        <a-plane position="0 -5 0" rotation="-90 0 0" width="1000" height="1000"
            multi-color-floor="preset: none"></a-plane>
    `;

    // Execute scripts that were inside the HTML
    setTimeout(() => {
        const forest = document.querySelector('[forest-generator]');
        const moon = document.querySelector('#moon');
        const lanterns = document.querySelector('[lanterns]');
        const water = document.querySelector('[water-helper]');

        // Trigger Moon Growth
        setTimeout(() => {
            if (moon) moon.emit('start-growth');
        }, 1000);

        // Trigger Forest Growth
        setTimeout(() => {
            if (forest) forest.emit('start-growth');
        }, 500);

        setTimeout(() => {
            console.log("Starting Lanterns and Water Rise...");
            if (lanterns) lanterns.emit('start-lanterns'); // Activate lantern logic
            if (water) water.emit('start-fill');           // Rise up
        }, 10000);

        setTimeout(() => {
            console.log("Returning Water (Drain)...");
            if (water) water.emit('start-drain');          // Drain down
        }, 20000); // 10s after rising (total 20s)

        // Sky Controller UI Logic
        const skyCtrl = document.querySelector('[sky-controller]');
        if (skyCtrl) {
            console.log("Emitting set-morning...");
            skyCtrl.emit('set-morning');
        }

        const floorCtrl = document.querySelector('[multi-color-floor]');
        if (floorCtrl) {
            console.log("Emitting set-floor-snow...");
            floorCtrl.emit('set-floor-snow');
        }
    }, 100); // Slight delay to ensure elements are in the DOM
}
