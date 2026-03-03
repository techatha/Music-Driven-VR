// custom-particles.js

AFRAME.registerComponent('custom-particles', {
    schema: {
        type: { type: 'string', default: 'stars' }, // Options: 'leaves', 'rain', 'stars', 'sparks', 'none'
        count: { type: 'int', default: 500 },
        color: { type: 'color', default: '#ffffff' }
    },

    init: function () {
        // 1. Setup Data Arrays
        this.velocities = new Float32Array(this.data.count * 3);
        this.sizes = new Float32Array(this.data.count);
        this.lifetimes = new Float32Array(this.data.count);

        // 2. Setup Three.js Geometry & Material
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(this.data.count * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: new THREE.Color(this.data.color),
            size: this.data.type === 'rain' ? 0.05 : 0.15,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        // 3. Create the Points Mesh and attach to A-Frame Entity
        this.points = new THREE.Points(geo, mat);
        this.points.frustumCulled = false;
        this.el.setObject3D('particle-mesh', this.points);

        // 4. Spawn the initial particles
        this.resetParticles();
    },

    update: function (oldData) {
        // If we change the type dynamically (e.g. 'rain' to 'sparks'), recalculate!
        if (oldData.type !== this.data.type || oldData.color !== this.data.color) {
            this.points.material.size = this.data.type === 'rain' ? 0.05 : 0.15;
            this.points.material.color.set(this.data.color);
            this.resetParticles();
        }
    },

    resetParticles: function () {
        if (this.data.type === 'none') {
            this.points.visible = false;
            return;
        }
        this.points.visible = true;
        const positions = this.points.geometry.attributes.position.array;
        for (let i = 0; i < this.data.count; i++) {
            // Initialize basic properties
            this.initParticle(positions, i);
        }
        this.points.geometry.attributes.position.needsUpdate = true;
    },

    initParticle: function (positions, i) {
        const i3 = i * 3;
        const spread = 20;

        switch (this.data.type) {
            case 'leaves':
                positions[i3] = (Math.random() - 0.5) * spread;
                positions[i3 + 1] = Math.random() * 15 + 5;
                positions[i3 + 2] = (Math.random() - 0.5) * spread;
                this.velocities[i3] = (Math.random() - 0.5) * 0.3;
                this.velocities[i3 + 1] = -Math.random() * 0.5 - 0.2;
                this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.3;
                break;
            case 'rain':
                positions[i3] = (Math.random() - 0.5) * spread;
                positions[i3 + 1] = Math.random() * 20;
                positions[i3 + 2] = (Math.random() - 0.5) * spread;
                this.velocities[i3] = 0;
                this.velocities[i3 + 1] = -Math.random() * 8 - 4;
                this.velocities[i3 + 2] = 0;
                break;
            case 'stars':
                positions[i3] = (Math.random() - 0.5) * spread * 1.5;
                positions[i3 + 1] = Math.random() * 12 + 1;
                positions[i3 + 2] = (Math.random() - 0.5) * spread * 1.5;
                this.velocities[i3] = (Math.random() - 0.5) * 0.5;
                this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.5;
                this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
                break;
            case 'sparks':
                positions[i3] = (Math.random() - 0.5) * 8;
                positions[i3 + 1] = Math.random() * 3;
                positions[i3 + 2] = (Math.random() - 0.5) * 8;
                this.velocities[i3] = (Math.random() - 0.5) * 2;
                this.velocities[i3 + 1] = Math.random() * 3 + 1;
                this.velocities[i3 + 2] = (Math.random() - 0.5) * 2;
                break;
        }
        this.lifetimes[i] = Math.random();
    },

    tick: function (time, timeDelta) {
        if (this.data.type === 'none' || !this.points.visible) return;

        const dt = timeDelta / 1000; // A-Frame delta is in ms, convert to seconds
        const pos = this.points.geometry.attributes.position.array;
        const spread = 20;

        // --- HOOK INTO YOUR MUSIC MANAGER ---
        let energy = 0;
        let isBeat = false;
        const manager = this.el.sceneEl.querySelector('[music-manager]');
        if (manager && manager.components['music-manager']) {
            energy = manager.components['music-manager'].currentEnergy || 0;

            // Assuming your music manager flags 'isBeat' on the exact frame a beat hits
            isBeat = manager.components['music-manager'].isBeat || false;
        }

        // --- PHYSICS ENGINE ---
        for (let i = 0; i < this.data.count; i++) {
            // ... (rest of the physics logic)
            const i3 = i * 3;
            this.lifetimes[i] -= dt * 0.3;

            pos[i3] += this.velocities[i3] * dt;
            pos[i3 + 1] += this.velocities[i3 + 1] * dt;
            pos[i3 + 2] += this.velocities[i3 + 2] * dt;

            // Beat response (Explode outward!)
            if (isBeat && this.data.type !== 'rain') {
                this.velocities[i3] += (Math.random() - 0.5) * energy * 2;
                this.velocities[i3 + 1] += Math.random() * energy * 1.5;
                this.velocities[i3 + 2] += (Math.random() - 0.5) * energy * 2;
            }

            // Respawn logic if they fall out of bounds
            let respawn = false;
            if (this.data.type === 'rain' && pos[i3 + 1] < 0) respawn = true;
            if (this.data.type === 'leaves' && pos[i3 + 1] < 0) respawn = true;
            if (this.data.type === 'sparks' && (pos[i3 + 1] < 0 || this.lifetimes[i] < 0)) respawn = true;
            if (this.data.type === 'stars' && this.lifetimes[i] < 0) respawn = true;
            if (Math.abs(pos[i3]) > spread || Math.abs(pos[i3 + 2]) > spread) respawn = true;

            if (respawn) {
                this.initParticle(pos, i);
            }

            // Gravity specifically for sparks
            if (this.data.type === 'sparks') {
                this.velocities[i3 + 1] -= 3 * dt;
            }
        }

        // Glow brighter based on audio energy!
        this.points.material.opacity = 0.4 + energy * 0.5;
        this.points.geometry.attributes.position.needsUpdate = true;
    }
});
