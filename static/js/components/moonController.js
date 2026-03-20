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
                node.material.transparent = data < 1.0;
                // FIX: Enable depthWrite when visible (>0.1) so it blocks stars even if semi-transparent (0.7)
                node.material.depthWrite = data > 0.1;
                node.castShadow = true;
                node.receiveShadow = true;
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

                // Store original emissive for reverting
                if (!node.userData.originalEmissive) {
                    node.userData.originalEmissive = node.material.emissive.clone();
                }

                // Ensure it glows
                if (node.material.map) {
                    node.material.emissiveMap = node.material.map;
                    node.material.emissive.setHex(0xffffff);
                    node.material.emissiveIntensity = 1.0;
                } else if (node.material.emissive) {
                    node.material.emissive.setHex(0xaaaaaa);
                    node.material.emissiveIntensity = 0.5;
                }

                // If currently marked as sun, override immediately
                if (data === 9.99) { // Using 9.99 as a magic number to flag Sun mode dynamically from moon-controller
                    node.material.emissive.setHex(0xffea00); // Bright Yellow
                    node.material.emissiveIntensity = 2.0;
                    node.material.opacity = 1.0;
                    node.material.transparent = false;
                    node.material.map = null; // Remove craters
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
            this.el.removeAttribute('animation__fadein');
            this.el.setAttribute('animation__fadeout', {
                property: 'model-opacity',
                to: 0,
                dur: 2000,
                easing: 'linear'
            });
        });

        // Toggle between Sun and Moon based on Global Sky Events emitted by SceneThemeController
        window.addEventListener('sky-theme-changed', (e) => {
            const time = e.detail.time;
            if (time === 'day' || time === 'morning') {
                this.becomeSun();
            } else if (time === 'evening') {
                this.becomeSun(0xff8800);
            } else if (time === 'night') {
                this.becomeMoon();
            }
        });
    },

    becomeSun: function (colorHex = 0xffea00) {
        // Change the moon into a glowing Sun
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.traverse((node) => {
                if (node.isMesh) {
                    node.material.map = null; // Remove craters
                    node.material.emissiveMap = null;
                    node.material.emissive.setHex(colorHex);
                    node.material.emissiveIntensity = 2.0;
                    node.material.opacity = 1.0;
                    node.material.transparent = false;
                    node.material.needsUpdate = true;
                }
            });
        }
    },

    becomeMoon: function () {
        // Revert it back to a Moon
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.traverse((node) => {
                if (node.isMesh) {
                    const textureLoader = new THREE.TextureLoader();
                    node.material.map = textureLoader.load('static/assets/3Dmodels/moon/textures/Material.002_diffuse.jpeg');
                    node.material.map.encoding = THREE.sRGBEncoding;
                    node.material.emissiveMap = node.material.map;
                    node.material.emissive.setHex(0xffffff);
                    node.material.emissiveIntensity = 1.0;
                    node.material.opacity = 0.7; // Ghostlier look for night
                    node.material.transparent = true;
                    node.material.needsUpdate = true;
                }
            });
        }
    }
});
