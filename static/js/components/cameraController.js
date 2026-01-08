AFRAME.registerComponent('camera-controller', {
    schema: {
        target: { type: 'selector' },
        offset: { type: 'vec3', default: { x: 0, y: 1.6, z: 0 } },
        copyRotationY: { type: 'boolean', default: false } // Option to follow yaw but not pitch/roll
    },

    tick: function () {
        if (!this.data.target) return;

        // Get target position
        const targetPos = this.data.target.object3D.position;

        // Use the offset
        this.el.object3D.position.set(
            targetPos.x + this.data.offset.x,
            targetPos.y + this.data.offset.y,
            targetPos.z + this.data.offset.z
        );

        // Optionally copy Y rotation (yaw) to face the same way as the boat
        if (this.data.copyRotationY) {
            this.el.object3D.rotation.y = this.data.target.object3D.rotation.y;
        }
    }
});
