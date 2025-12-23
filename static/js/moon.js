// Helper component to handle glTF opacity animation
AFRAME.registerComponent('model-opacity', {
    schema: { type: 'number', default: 1.0 },
    init: function () {
        this.el.addEventListener('model-loaded', this.update.bind(this));
    },
    update: function () {
        const mesh = this.el.getObject3D('mesh');
        const data = this.data;
        if (!mesh) {
            // console.log('Model-opacity: No mesh yet');
            return;
        }
        // console.log('Model-opacity updating to:', data);
        mesh.traverse(function (node) {
            if (node.isMesh) {
                node.material.opacity = data;
                node.material.transparent = true; // Always enable transparency if we are messing with opacity
                node.material.fog = false; // IGNORE FOG

                // FIX: If map is missing, manually load it!
                if (!node.material.map) {
                    const textureLoader = new THREE.TextureLoader();
                    // We know where the file is from our directory check
                    const texPath = 'static/assets/3Dmodels/moon/textures/Material.002_diffuse.jpeg';
                    node.material.map = textureLoader.load(texPath);
                    node.material.map.encoding = THREE.sRGBEncoding;
                    node.material.map.flipY = false;
                }

                // Ensure it glows (Moon should be bright!)
                // FIX: Use the texture itself as the emissive map so craters stay dark!
                if (node.material.map) {
                    node.material.emissiveMap = node.material.map;
                    node.material.emissive.setHex(0xffffff); // White tint for the map
                    node.material.emissiveIntensity = 1.0;   // Adjust brightness here
                } else if (node.material.emissive) {
                    // Fallback if no texture
                    node.material.emissive.setHex(0xaaaaaa);
                    node.material.emissiveIntensity = 0.5;
                }

                node.material.needsUpdate = true;
            }
        });
    }
});

// Moon Controller to handle fade in/out logic
AFRAME.registerComponent('moon-controller', {
    init: function () {
        // Orient the moon to face the center (0,0,0)
        // This ensures the "side" (equator) faces the user, hiding the bottom pole
        this.el.object3D.lookAt(0, 0, 0);

        // Listen for start-growth -> Fade In
        this.el.addEventListener('start-growth', () => {
            this.el.removeAttribute('animation__fadeout'); // Stop fadeout if running
            this.el.setAttribute('animation__fadein', {
                property: 'model-opacity',
                to: 0.7, // Target opacity (Lowered from 1 for ghostlier look)
                dur: 2000,
                easing: 'linear'
            });
        });

        // Listen for start-shrink -> Fade Out
        this.el.addEventListener('start-shrink', () => {
            this.el.removeAttribute('animation__fadein'); // Stop fadein if running
            this.el.setAttribute('animation__fadeout', {
                property: 'model-opacity',
                to: 0,
                dur: 2000,
                easing: 'linear'
            });
        });
    }
});
