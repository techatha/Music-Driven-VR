/* Window View Controller */

AFRAME.registerComponent('window-view-controller', {
    schema: {
        view: { type: 'string', default: 'city' }, // Default view
        radius: { type: 'number', default: 30 },   // Distance from center
        thetaLength: { type: 'number', default: 180 }, // Arc length in degrees
        height: { type: 'number', default: 30 }
    },
    init: function () {
        this.views = {
            'city': 'assets/images/hydrangeas-7065907_1280.jpg'
            // Add more views here later
        };

        this.updateView();
    },
    update: function (oldData) {
        if (oldData.view !== this.data.view) {
            this.updateView();
        }
    },
    updateView: function () {
        const viewPath = this.views[this.data.view];
        if (viewPath) {
            const textureUrl = '/static/' + viewPath;
            // Create or update curved image
            // We use a-curvedimage or just a cylinder segment inverted
            // Using a-curvedimage logic manually with geometry primitive

            this.el.setAttribute('geometry', {
                primitive: 'cylinder',
                radius: this.data.radius,
                height: this.data.height,
                thetaLength: this.data.thetaLength,
                thetaStart: 180 - (this.data.thetaLength / 2), // Center around 180 (back?) or 90 (right). Window is at x=10 (Right). 
                // Right is -90 rotation typically? 
                // Let's assume window is at Right Wall (x=10). Camera faces -z. Right is +x.
                // In A-Frame, +x is Right. Rotation 0 is facing -z.
                // 90 deg rotation faces -x. -90 faces +x.
                // We want the curve to be at +x. 
                // thetaStart 270 is +x (since 0 is -z? No, 0 is +z in geometry cylinder?). 
                // Cylinder primitive: 0 is +z. 90 is +x. 180 is -z. 270 is -x. 
                // Wait, A-Frame cylinder: 
                // "The cylinder is created centered at the origin... side faces the outside."
                // To see it from inside, we need `material="side: back"`.
                // Or `scale="-1 1 1"`.
                // Position: 0 0 0 (center of room).
                // Rotation: we can rotate the entity.
                openEnded: true
            });

            this.el.setAttribute('material', {
                src: textureUrl,
                side: 'back', // Render on inside
                shader: 'flat'
            });

            // Adjust rotation to face the window
            // Window is at +x (10, 0, 0).
            // Cylinder 0 starts at +z. 
            // We want center of arc at +x. That is 90 degrees.
            // So thetaStart should be around 90?
            // Let's try rotating the entity instead of messing with thetaStart too much.
            this.el.setAttribute('rotation', '0 -90 0'); // Rotate so 'back' of cylinder faces center?
            // If side: back, we are inside.
            // 0 deg: texture center is at -z (Wait, cylinder UVs...).
            // Let's just place it and see.
        }
    }
});
