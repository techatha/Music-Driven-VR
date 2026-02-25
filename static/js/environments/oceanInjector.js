function injectOceanEnvironment(rootElement) {
    rootElement.innerHTML = `
        <!-- Procedural Sunset via Sky Controller -->
        <a-entity sky-controller="type: procedural"></a-entity>

        <!-- Manually adding ambient light to ensure models aren't too dark vs the backend -->
        <a-light type="ambient" color="#222"></a-light>

        <a-circle id="ocean" position="0 -20 0" rotation="-90 0 0" radius="800" color="#469493" material="src: #waterNormal; repeat: 100 100; roughness: 0.1; metalness: 0.5; normalMap: #waterNormal; normalScale: 1 1;"
        animation="property: material.normalTextureOffset; from: 0 0; to: 1 0; loop: true; dur: 100000; easing: linear"
        animation__wobble="property: position; dir: alternate; dur: 4000; easing: easeInOutSine; loop: true; to: 0 -18.5 0; from: 0 -25 0">
        </a-circle>

        <!-- Ship Y -->
        <a-entity ship-y-controller position="0 -20 0" scale="40 40 40"></a-entity>
    `;
}
