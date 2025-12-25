AFRAME.registerComponent('star-system', {
    schema: {
        color: { type: 'color', default: '#FFF' },
        radius: { type: 'number', default: 300 }, // Stars will spawn within this radius
        count: { type: 'number', default: 1000 },
        size: { type: 'number', default: 1 } // Point size
    },

    init: function () {
        console.log('Star System Initializing...');
        // Create geometry and material for the stars
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        // Generate random positions
        for (let i = 0; i < this.data.count; i++) {
            // Random position on/in a sphere
            // Using spherical coordinates for better distribution
            const r = this.data.radius * (0.8 + Math.random() * 0.4); // Variation in distance (240 - 360 range approximately)
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            // We only want stars ABOVE the horizon mostly? 
            // Or all around? Space is everywhere. Let's do all around for now.
            // Actually, for a sky feel, usually y > 0 is better, but this is a VR space scene, so all around is fine.

            vertices.push(x, y, z);
        }

        // Add attributes to geometry
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // Create material
        // Using a texture for softness if possible, but basic points work too.
        // Let's use a simple circular sprite if we can, or just PointsMaterial.
        // For simplicity and no assets, standard square points are okay, 
        // but we can make them "size attenuation" enabled so they get smaller with distance.
        const material = new THREE.PointsMaterial({
            color: this.data.color,
            size: this.data.size,
            sizeAttenuation: true, // Points shrink with distance
            transparent: true,
            opacity: 0.8,
            fog: false // Ignore scene fog
        });

        // Create the particle system
        this.stars = new THREE.Points(geometry, material);

        // Add to the entity
        this.el.setObject3D('mesh', this.stars);
    },

    remove: function () {
        if (this.stars) {
            this.el.removeObject3D('mesh');
        }
    }
});
