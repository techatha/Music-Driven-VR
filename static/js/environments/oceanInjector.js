function injectOceanEnvironment(rootElement) {
    rootElement.innerHTML = `
        <!-- Sky (via sky-controller — starts as sunset) -->
        <a-entity sky-controller="type: gradient; startTime: sunset"></a-entity>
        <a-sky material="shader: gradient-shader; topColor: #331133; bottomColor: #ff9900; offset: 400; exponent: 0.6"></a-sky>
        <a-entity star-system="count: 1000; radius: 400; color: #FFF"></a-entity>

        <!-- Lighting (Stable Baseline, Flashing Directors, Player Follower) -->
        <a-entity scene-lighting="preset: ocean"></a-entity>

        <a-circle id="ocean" position="0 -20 0" rotation="-90 0 0" radius="800" color="#469493" material="src: #waterNormal; repeat: 100 100; roughness: 0.1; metalness: 0.5; normalMap: #waterNormal; normalScale: 1 1;"
        animation="property: material.normalTextureOffset; from: 0 0; to: 1 0; loop: true; dur: 100000; easing: linear"
        animation__wobble="property: position; dir: alternate; dur: 4000; easing: easeInOutSine; loop: true; to: 0 -18.5 0; from: 0 -25 0">
        </a-circle>

        <!-- Ship Y -->
        <a-entity ship-y-controller position="0 -20 0" scale="40 40 40"></a-entity>

        <!-- Floor -->
        <a-plane position="0 -30 0" rotation="-90 0 0" width="1000" height="1000"
            multi-color-floor="preset: none"></a-plane>

        <!-- Particles (Rain) -->
        <a-entity custom-particles="type: rain; count: 25000; color: #88ccff" position="0 20 0"></a-entity>

        <!-- Player Rig -->
        <a-entity id="rig" position="0 1.6 0">
            <a-entity camera look-controls wasd-controls position="0 0 0"></a-entity>
        </a-entity>
    `;
}
