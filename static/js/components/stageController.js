AFRAME.registerComponent('stage-controller', {
    schema: {
        // We can add animation settings here later (e.g., moveDuration)
    },
    init: function () {
        this.createStage();
        this.createAuditorium();
    },

    createStage: function () {
        // Main Stage Cylinder
        const stage = document.createElement('a-cylinder');
        stage.setAttribute('position', '0 0.5 0');
        stage.setAttribute('radius', 15);
        stage.setAttribute('height', 1);
        stage.setAttribute('color', '#fff');
        stage.setAttribute('material', 'roughness: 0.2; metalness: 0.8');

        // Glow Edge (Torus)
        const glowEdge = document.createElement('a-torus');
        glowEdge.setAttribute('radius', 15);
        glowEdge.setAttribute('radius-tubular', 0.2);
        glowEdge.setAttribute('rotation', '90 0 0');
        glowEdge.setAttribute('color', '#0F0F0F');
        glowEdge.setAttribute('material', 'emissive: #ffd200; emissiveIntensity: 2');

        stage.appendChild(glowEdge);
        this.el.appendChild(stage);
    },

    createAuditorium: function () {
        // Helper to create tiers
        const createTier = (y, innerR, outerR, height, colorRing, colorWall) => {
            // Seating Ring (Floor)
            const ring = document.createElement('a-ring');
            ring.setAttribute('position', `0 ${y + 0.5} 0`); // Slightly above base
            ring.setAttribute('rotation', '-90 0 0');
            ring.setAttribute('radius-inner', innerR);
            ring.setAttribute('radius-outer', outerR);
            ring.setAttribute('color', colorRing);
            ring.setAttribute('material', 'side: double');
            this.el.appendChild(ring);

            // Wall (Cylinder)
            const wall = document.createElement('a-cylinder');
            wall.setAttribute('position', `0 ${y} 0`);
            wall.setAttribute('radius', outerR);
            wall.setAttribute('height', height);
            wall.setAttribute('open-ended', 'true');
            wall.setAttribute('color', colorWall);
            wall.setAttribute('material', 'side: double');
            this.el.appendChild(wall);
        };

        // Tier 1
        createTier(1.0, 18, 22, 2, '#333', '#222');
        // Tier 2
        createTier(2.5, 22, 26, 5, '#444', '#2a2a2a');
        // Tier 3
        createTier(4.0, 26, 30, 8, '#555', '#333');
        // Tier 4
        createTier(6.0, 30, 35, 12, '#666', '#444'); // Adjusted height for outer wall logic
    },

    // Example function to move stage
    moveStage: function (yPosition) {
        this.el.setAttribute('animation', {
            property: 'position',
            to: `0 ${yPosition} 0`,
            dur: 2000,
            easing: 'easeInOutQuad'
        });
    }
});
