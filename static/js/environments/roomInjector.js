function injectRoomEnvironment(rootElement) {
    rootElement.innerHTML = `
        <!-- Basic Room Structure -->
        <!-- Floor (Wooden) -->
        <a-plane position="0 0 0" rotation="-90 0 0" width="20" height="20" color="#8B4513"
            material="roughness: 0.8"></a-plane>
        <!-- Multi-Color Floor (below room, visible from window) -->
        <a-plane position="0 -10 0" rotation="-90 0 0" width="5000" height="5000"
            multi-color-floor="preset: none"></a-plane>

        <!-- Ceiling (Height 12) -->
        <a-plane position="0 12 0" rotation="90 0 0" width="20" height="20" color="#F5F5DC"></a-plane>

        <!-- Window View (Outside) -->
        <!-- Decorative Polygon Mountains Outside -->
        <a-entity position="60 10 -40">
            <a-cone position="0 0 -30" radius-bottom="40" radius-top="0" height="50" color="#2c3e50" segments-radial="4" material="flatShading: true; roughness: 1"></a-cone>
            <a-cone position="10 -5 -15" radius-bottom="30" radius-top="0" height="35" color="#34495e" segments-radial="5" material="flatShading: true; roughness: 1"></a-cone>
            <a-cone position="-15 -10 -20" radius-bottom="35" radius-top="0" height="40" color="#1a252f" segments-radial="4" material="flatShading: true; roughness: 1"></a-cone>
            <a-cone position="-5 -2 15" radius-bottom="25" radius-top="0" height="30" color="#3d566e" segments-radial="5" material="flatShading: true; roughness: 1"></a-cone>
            <a-cone position="20 -10 10" radius-bottom="30" radius-top="0" height="40" color="#2c3e50" segments-radial="4" material="flatShading: true; roughness: 1"></a-cone>
        </a-entity>
        
        <!-- Add weather particles exclusively *outside* the window. 
             Spread is 150 = radius 75. Window is at X=10.
             Positioning storm at X=85 ensures particles hit X=10 exactly without entering! -->
        <a-entity custom-particles="type: rain; count: 20000; color: #88ccff" position="85 20 0"></a-entity>

        <!-- Walls (Height 12) -->
        <a-box position="0 6 -10" width="20" height="12" depth="0.1" color="#F5F5DC"></a-box> <!-- Back Wall -->

        <!-- Left Wall (Segmented for Door) -->
        <a-box position="-10 9.5 0" rotation="0 90 0" width="20" height="5" depth="0.1" color="#F5F5DC"></a-box>
        <a-box position="-10 3.5 -5.75" rotation="0 90 0" width="8.5" height="7" depth="0.1" color="#F5F5DC"></a-box>
        <a-box position="-10 3.5 5.75" rotation="0 90 0" width="8.5" height="7" depth="0.1" color="#F5F5DC"></a-box>
        <a-box position="-10 6.5 0" rotation="0 90 0" width="3" height="1.1" depth="0.1" color="#F5F5DC"></a-box>

        <!-- Right Wall (Segmented for Window) -->
        <a-box position="10 9.5 0" rotation="0 90 0" width="20" height="5" depth="0.1" color="#F5F5DC"></a-box>
        <a-box position="10 1.5 0" rotation="0 90 0" width="20" height="3" depth="0.1" color="#F5F5DC"></a-box>
        <a-box position="10 5 -6.25" rotation="0 90 0" width="7.5" height="4" depth="0.1" color="#F5F5DC"></a-box>
        <a-box position="10 5 6.25" rotation="0 90 0" width="7.5" height="4" depth="0.1" color="#F5F5DC"></a-box>

        <a-box position="0 6 10" width="20" height="12" depth="0.1" color="#F5F5DC"></a-box> <!-- Front Wall -->

        <!-- Sky (via sky-controller) -->
        <a-entity sky-controller="type: gradient; startTime: night"></a-entity>
        <a-sky material="shader: gradient-shader; topColor: #020205; bottomColor: #050510; offset: 400; exponent: 0.6"></a-sky>
        <a-entity star-system="count: 1000; radius: 400; color: #FFF"></a-entity>

        <!-- Rug -->
        <a-circle position="0 0.01 0" rotation="-90 0 0" radius="3" color="#800000"></a-circle>

        <!-- Furniture Models -->
        <!-- Door (Scaled Up 5x from 0.035 -> 0.175) -->
        <a-entity door-controller position="-10 0 0" rotation="0 90 0"></a-entity>

        <!-- Couch (New Model) -->
        <a-entity couch-controller position="0 0.5 -3"></a-entity>

        <!-- Clock (Grandfather, Scaled Up 5x from 0.8 -> 4.0) -->
        <a-entity clock-controller position="0 0 -9"></a-entity>

        <!-- Bookshelf (with Light) -->
        <a-entity position="-6 0 -9">
            <a-entity bookshelf-controller></a-entity>
            <!-- Dedicated Light for Bookshelf -->
            <a-light type="point" position="0 2 1" color="#FFD700" intensity="1.5" distance="5" decay="2"></a-light>
        </a-entity>

        <!-- Floor Lamp (New Model, Scaled Up) -->
        <a-entity position="-3.5 5 -3.5">
            <a-entity lamp-controller></a-entity>
        </a-entity>

        <!-- Coffee Table (New Model) -->
        <a-entity coffeetable-controller position="-1.633 -0.010 1.667"></a-entity>

        <!-- Curtain (Over Window) -->
        <a-entity curtain-controller position="9 2 0" rotation="0 -90 0"></a-entity>

        <!-- Fireplace -->
        <a-entity fireplace-controller position="0 0 9.217" rotation="0 180 0"></a-entity>
        
        <!-- Particles (Sparks escaping fireplace) -->
        <a-entity custom-particles="type: sparks; count: 100; color: #ff8800" position="0 0.5 8.5"></a-entity>

        <!-- Window Frame -->
        <a-box position="10 5 0" width="0.2" height="4.2" depth="5.2" color="#8B4513" visible="false"></a-box>
        <!-- Hidden guide -->
        <a-box position="10 7 0" width="0.3" height="0.2" depth="5.2" color="#5C4033"></a-box> <!-- Frame Top -->
        <a-box position="10 3 0" width="0.3" height="0.2" depth="5.2" color="#5C4033"></a-box> <!-- Frame Bottom -->
        <a-box position="10 5 -2.5" width="0.3" height="4" depth="0.2" color="#5C4033"></a-box> <!-- Frame Left -->
        <a-box position="10 5 2.5" width="0.3" height="4" depth="0.2" color="#5C4033"></a-box> <!-- Frame Right -->

        <!-- Glass Pane -->
        <a-plane position="10 5 0" rotation="0 -90 0" width="5" height="4" color="#87CEEB" opacity="0.2"
            material="transparent: true"></a-plane>

        <!-- Lighting (Cozy Warmth & Music Flash) -->
        <a-entity scene-lighting="preset: room"></a-entity>

        <!-- Camera -->
        <a-entity position="0 1.6 4">
            <a-camera look-controls wasd-controls></a-camera>
        </a-entity>
    `;
}
