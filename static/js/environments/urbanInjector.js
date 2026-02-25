function injectUrbanEnvironment(rootElement) {
    rootElement.innerHTML = `
        <!-- Urban Environment Component -->
        <a-entity urban-environment></a-entity>

        <!-- City Block Component -->
        <a-entity city-block="width: 30; depth: 100"></a-entity>

        <!-- Street Lights Component -->
        <a-entity street-lights="width: 15; depth: 100"></a-entity>

        <!-- Player Rig -->
        <a-entity id="rig" position="0 1.6 0">
            <a-entity camera look-controls wasd-controls position="0 0 0"></a-entity>
        </a-entity>
    `;
}
