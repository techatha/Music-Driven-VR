AFRAME.registerComponent('lanterns', {
    schema: {
        count: { type: 'number', default: 50 },
        range: { type: 'number', default: 100 },
        speed: { type: 'number', default: 0.5 },
        color: { type: 'color', default: '#FFD700' },
        autoStart: { type: 'boolean', default: false } // New property
    },

    init: function () {
        this.lanterns = [];
        this.isPlaying = this.data.autoStart; // State flag
        this.createLanterns();

        // Listen for start event
        this.el.addEventListener('start-lanterns', () => {
            console.log("Lanterns started!");
            this.isPlaying = true;
        });
    },

    createLanterns: function () {
        const data = this.schema;
        const range = parseFloat(data.range) || 100;
        console.log(`Spawning ${data.count} lanterns within range ${range}`);

        for (let i = 0; i < data.count; i++) {
            const el = document.createElement('a-entity');

            // Random position on the water (XZ plane)
            // Safety check: ensure x/z result in valid numbers
            const x = (Math.random() - 0.5) * range;
            const z = (Math.random() - 0.5) * range;
            const y = Math.random() * 20;

            if (isNaN(x) || isNaN(z)) {
                console.error("Lantern position NaN! Skipping.");
                continue;
            }

            el.setAttribute('position', { x: x, y: y, z: z });

            // Visual: Glowing paper lantern
            el.setAttribute('geometry', {
                primitive: 'cylinder',
                radius: 0.3,
                height: 0.8,
                openEnded: true
            });

            // Material: Emissive glowing paper
            el.setAttribute('material', {
                color: '#fff',
                emissive: data.color,
                emissiveIntensity: 1.5,
                side: 'double',
                transparent: true,
                opacity: 0.9
            });

            this.el.appendChild(el);

            this.lanterns.push({
                el: el,
                speed: data.speed * (0.5 + Math.random()),
                wobbleOffset: Math.random() * 100
            });
        }
    },

    tick: function (time, timeDelta) {
        if (!this.isPlaying) return; // Don't animate until started

        const dt = timeDelta / 1000;

        this.lanterns.forEach(lantern => {
            const pos = lantern.el.object3D.position;

            // Move up
            pos.y += lantern.speed * dt;

            // Slight horizontal wobble
            pos.x += Math.sin(time / 1000 + lantern.wobbleOffset) * 0.01;
            pos.z += Math.cos(time / 1000 + lantern.wobbleOffset) * 0.01;

            // Reset if too high
            if (pos.y > 50) {
                pos.y = 0;
                pos.x = (Math.random() - 0.5) * this.schema.range;
                pos.z = (Math.random() - 0.5) * this.schema.range;
            }
        });
    }
});
