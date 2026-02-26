function injectUrbanEnvironment(rootElement) {
    rootElement.innerHTML = `
        <!-- Lighting -->
        <a-light type="ambient" color="#334" intensity="0.6"></a-light>
        <a-light type="directional" color="#ffe0c0" intensity="1.0" position="1 3 2"></a-light>
        <a-light type="directional" color="#8090ff" intensity="0.3" position="-1 2 -1"></a-light>

        <!-- Sky -->
        <a-entity sky-controller="type: gradient; startTime: night"></a-entity>
        <a-sky material="shader: gradient-shader; topColor: #020205; bottomColor: #0a0a15; offset: 400; exponent: 0.6"></a-sky>
        <a-entity star-system="count: 2000; radius: 400; color: #FFF"></a-entity>

        <!-- Urban Environment Component -->
        <a-entity urban-environment></a-entity>

        <!-- City Block Component -->
        <a-entity city-block="width: 30; depth: 100"></a-entity>

        <!-- Street Lights Component -->
        <a-entity street-lights="width: 15; depth: 100"></a-entity>

        <!-- Player Rig -->
        <a-entity id="rig" position="0 1.6 30">
            <a-entity camera look-controls wasd-controls position="0 0 0"></a-entity>
        </a-entity>
    `;
}
