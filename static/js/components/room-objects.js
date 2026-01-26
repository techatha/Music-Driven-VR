/* Room Objects Controllers */

// Door Controller
AFRAME.registerComponent('door-controller', {
    schema: {
        open: { type: 'boolean', default: false },
        model: { type: 'string', default: 'assets/3Dmodels/wooden_door/scene.gltf' },
        scale: { type: 'vec3', default: { x: 1, y: 1, z: 1 } }
    },
    init: function () {
        // Load Model
        const modelUrl = '/static/' + this.data.model;
        this.el.setAttribute('gltf-model', modelUrl);
        this.el.setAttribute('scale', this.data.scale);

        this.el.addEventListener('click', () => {
            const isOpen = this.data.open;
            if (isOpen) {
                this.el.setAttribute('animation', 'property: rotation; into: 0 90 0; dur: 1000'); // Close
            } else {
                this.el.setAttribute('animation', 'property: rotation; to: 0 0 0; dur: 1000'); // Open (adjust rotation as needed)
            }
            this.data.open = !isOpen;
        });
        // Initial rotation might need adjustment based on model
    }
});

// Clock Controller
AFRAME.registerComponent('clock-controller', {
    schema: {
        model: { type: 'string', default: 'assets/3Dmodels/clock/scene.gltf' },
        scale: { type: 'vec3', default: { x: 3.5, y: 3.5, z: 3.5 } }
    },
    init: function () {
        const modelUrl = '/static/' + this.data.model;
        this.el.setAttribute('gltf-model', modelUrl);
        this.el.setAttribute('scale', this.data.scale);

        // get position from model to add offset
        const position = this.el.getAttribute('position');
        const newPosition = {
            x: position.x,
            y: position.y + 3.5,
            z: position.z
        };
        this.el.setAttribute('position', newPosition);
    }
});

// Bookshelf Controller
AFRAME.registerComponent('bookshelf-controller', {
    schema: {
        model: { type: 'string', default: 'assets/3Dmodels/dusty_old_bookshelf_free/scene.gltf' },
        scale: { type: 'vec3', default: { x: 3, y: 3, z: 3 } }
    },
    init: function () {
        const modelUrl = '/static/' + this.data.model;
        this.el.setAttribute('gltf-model', modelUrl);
        this.el.setAttribute('scale', this.data.scale);

        // get rotation from model to add offset
        const rotation = this.el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
        const newRotation = {
            x: rotation.x,
            y: (rotation.y + 180) % 360,
            z: rotation.z
        };
        this.el.setAttribute('rotation', newRotation);

        // get position from model to add offset
        const position = this.el.getAttribute('position') || { x: 0, y: 0, z: 0 };
        const newPosition = {
            x: position.x,
            y: position.y + .1,
            z: position.z
        };
        this.el.setAttribute('position', newPosition);
    }
});

// Couch Controller
AFRAME.registerComponent('couch-controller', {
    schema: {
        model: { type: 'string', default: 'assets/3Dmodels/couch/scene.gltf' },
        scale: { type: 'vec3', default: { x: 3, y: 3, z: 3 } },
    },
    init: function () {
        const modelUrl = '/static/' + this.data.model;
        this.el.setAttribute('gltf-model', modelUrl);
        this.el.setAttribute('scale', this.data.scale);
        // Add offset
        const currentPos = this.el.getAttribute('position') || { x: 0, y: 0, z: 0 };
        const newPos = {
            x: currentPos.x,
            y: currentPos.y + 1, // Add offset
            z: currentPos.z
        };
        this.el.setAttribute('position', newPos);
    }
});

// Lamp Controller
AFRAME.registerComponent('lamp-controller', {
    schema: {
        model: { type: 'string', default: 'assets/3Dmodels/pbr_floor_lamp_free_download/scene.gltf' },
        scale: { type: 'vec3', default: { x: .03, y: .03, z: .03 } }
    },
    init: function () {
        const modelUrl = '/static/' + this.data.model;
        this.el.setAttribute('gltf-model', modelUrl);
        this.el.setAttribute('scale', this.data.scale);

        // Get position set in HTML, default to 0 0 0 if missing
        const currentPos = this.el.getAttribute('position') || { x: 0, y: 0, z: 0 };
        const newPos = {
            x: currentPos.x,
            y: currentPos.y + 0.1, // Add offset
            z: currentPos.z
        };
        this.el.setAttribute('position', newPos);

        // Add Light
        const lightEl = document.createElement('a-entity');
        lightEl.setAttribute('light', {
            type: 'point',
            color: '#FFD700',
            intensity: 0.8,
            distance: 15,
            decay: 2
        });
        lightEl.setAttribute('position', '0 4 0');
        this.el.appendChild(lightEl);
    }
});

// Coffee Table Controller
AFRAME.registerComponent('coffeetable-controller', {
    schema: {
        model: { type: 'string', default: 'assets/3Dmodels/coffee_table/scene.gltf' },
        scale: { type: 'vec3', default: { x: 2, y: 2, z: 2 } },
        position: { type: 'vec3', default: { x: 0, y: 0, z: 0 } }
    },
    init: function () {
        const modelUrl = '/static/' + this.data.model;
        this.el.setAttribute('gltf-model', modelUrl);
        this.el.setAttribute('scale', this.data.scale);

        // Add position offset if needed
        const currentPos = this.el.getAttribute('position') || { x: 0, y: 0, z: 0 };
        const newPos = {
            x: currentPos.x + this.data.position.x,
            y: currentPos.y + this.data.position.y,
            z: currentPos.z + this.data.position.z
        };
        this.el.setAttribute('position', newPos);
    }
});

// Curtain Controller
AFRAME.registerComponent('curtain-controller', {
    schema: {
        model: { type: 'string', default: 'assets/3Dmodels/2_layer_curtain_with_role_box_curtain/scene.gltf' },
        scale: { type: 'vec3', default: { x: 2.2, y: 2.2, z: 2.2 } },
        position: { type: 'vec3', default: { x: 0, y: 0, z: 0 } }
    },
    init: function () {
        const modelUrl = '/static/' + this.data.model;
        this.el.setAttribute('gltf-model', modelUrl);
        this.el.setAttribute('scale', this.data.scale);

        // Add position offset if needed
        const currentPos = this.el.getAttribute('position') || { x: 0, y: 0, z: 0 };
        const newPos = {
            x: currentPos.x + this.data.position.x,
            y: currentPos.y + this.data.position.y,
            z: currentPos.z + this.data.position.z
        };
        this.el.setAttribute('position', newPos);
    }
});
