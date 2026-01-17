AFRAME.registerComponent('lanterns', {
    schema: {
        count: { type: 'number', default: 50 },
        range: { type: 'number', default: 100 },
        speed: { type: 'number', default: 0.5 },
        color: { type: 'color', default: '#FFD700' },
        autoStart: { type: 'boolean', default: false }
    },

    init: function () {
        this.lanterns = [];
        this.canAnimate = this.data.autoStart;

        // Hide initially until triggered
        if (!this.canAnimate) {
            this.el.setAttribute('visible', false);
        }

        console.log(`[Lanterns] Init. AutoStart: ${this.canAnimate}`);

        this.createLanterns();

        // Listen for start event
        this.el.addEventListener('start-lanterns', () => {
            console.log("[Lanterns] Event Received: start-lanterns");
            this.canAnimate = true;
            this.el.setAttribute('visible', true); // Show them
        });
    },

    createLanterns: function () {
        const data = this.data;
        const range = parseFloat(data.range) || 100;
        console.log(`[Lanterns] Spawning ${data.count} lanterns within range ${range}`);

        for (let i = 0; i < data.count; i++) {
            const el = document.createElement('a-entity');

            const x = (Math.random() - 0.5) * range;
            const z = (Math.random() - 0.5) * range;
            // Spawn BELOW the player/water so they float up from underneath
            const y = -5 + Math.random() * -10;

            if (isNaN(x) || isNaN(z)) continue;

            el.setAttribute('position', { x: x, y: y, z: z });

            // Visual: Glowing paper lantern
            el.setAttribute('geometry', {
                primitive: 'cylinder',
                radius: 0.3,
                height: 0.8,
                openEnded: true
            });

            // Random Size
            const scale = 0.8 + Math.random() * 0.5; // 0.8 to 1.3
            el.setAttribute('scale', { x: scale, y: scale, z: scale });

            el.setAttribute('material', {
                shader: 'gradient-shader',
                topColor: '#FFD700',    // Fixed Gold
                bottomColor: '#FF4500', // Fixed Red-Orange
                minY: -0.4,             // Bottom of cylinder (height 0.8)
                maxY: 0.4,              // Top of cylinder
                useLocal: 1.0,          // Use Local Coords -> Triggers Linear Logic
                opacity: 0.9,
                transparent: true,
                side: 'double',
                emissive: '#FFD700',
                emissiveIntensity: 0.5  // Balanced glow
            });

            // Point Light Removed for Performance

            this.el.appendChild(el);

            this.lanterns.push({
                el: el,
                speed: data.speed * (0.5 + Math.random()),
                wobbleOffset: Math.random() * 100
            });
        }
    },

    tick: function (time, timeDelta) {
        if (!this.canAnimate) return;

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
                pos.y = -10; // Respawn at bottom
                // Fix the other bug too: use this.data.range
                pos.x = (Math.random() - 0.5) * this.data.range;
                pos.z = (Math.random() - 0.5) * this.data.range;
            }
        });
    }
});
