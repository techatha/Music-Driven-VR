// Register a component to generate the forest
AFRAME.registerComponent('forest-generator', {
    schema: {
        count: { type: 'int', default: 100 },
        minRadius: { type: 'number', default: 20 },
        maxRadius: { type: 'number', default: 100 },
        smallScale: { type: 'number', default: 1.0 },
        bigScale: { type: 'number', default: 2.5 }
    },

    init: function () {
        const scene = this.el.sceneEl;
        const assets = document.querySelector('a-assets');

        // 1. Create the mixin if it doesn't exist
        if (!document.querySelector('#pine-tree-mixin')) {
            const mixin = document.createElement('a-mixin');
            mixin.setAttribute('id', 'pine-tree-mixin');
            // A tree is a group
            // We will construct the tree logic inside the loop for variety, 
            // or we can make a simple placeholder mixin.
            // Let's rely on creating entities directly for better control over random heights.
            assets.appendChild(mixin);
        }

        // 2. Generate Trees
        for (let i = 0; i < this.data.count; i++) {
            this.createTree();
        }
    },

    createTree: function () {
        // Random position in polar coordinates
        const angle = Math.random() * Math.PI * 2;
        const radius = this.data.minRadius + (Math.random() * (this.data.maxRadius - this.data.minRadius));

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Calculate Height based on Auditorium Tiers (Stepped Y)
        let y = 0;
        if (radius >= 18 && radius < 22) y = 1.5;      // Tier 1
        else if (radius >= 22 && radius < 26) y = 3.0; // Tier 2
        else if (radius >= 26 && radius < 30) y = 4.5; // Tier 3
        else if (radius >= 30 && radius < 35) y = 6.0; // Tier 4 (Top Ring)
        else y = 0;                                    // Outside (Ground)

        // Determine Base Scale based on Tier Position
        // Tier 4 ends at radius 35. If radius >= 35, it's outside --> Big Tree
        const isBigTree = radius >= 35;
        const baseScale = isBigTree ? this.data.bigScale : this.data.smallScale;

        // Scale the entire entity
        const scaleHeight = 1 + (Math.random() * 1.5); // 1x to 2.5x height (variation)
        const scaleWidth = 1 + (Math.random() * 0.5);  // 1x to 1.5x width (variation)

        // Container for the tree
        const treeEntity = document.createElement('a-entity');
        treeEntity.setAttribute('position', `${x} ${y} ${z}`);

        // Apply Base Scale + Variation
        // We apply baseScale to the entity's scale property so it affects everything uniformly
        treeEntity.setAttribute('scale', `${baseScale} ${baseScale} ${baseScale}`);

        // Trunk (Brown Cylinder)
        const trunk = document.createElement('a-cylinder');
        trunk.setAttribute('radius', 0.5 * scaleWidth);
        trunk.setAttribute('height', 2 * scaleHeight);
        trunk.setAttribute('color', '#5D4037'); // Wood brown
        trunk.setAttribute('position', `0 ${1 * scaleHeight} 0`);
        treeEntity.appendChild(trunk);

        // Leaves (Green Cone) - Layer 1 (Bottom/Wide)
        const leaves1 = document.createElement('a-cone');
        leaves1.setAttribute('radius-bottom', 2.5 * scaleWidth);
        leaves1.setAttribute('radius-top', 0);
        leaves1.setAttribute('height', 3 * scaleHeight);
        leaves1.setAttribute('color', '#2E7D32'); // Forest Green
        leaves1.setAttribute('position', `0 ${3 * scaleHeight} 0`);
        treeEntity.appendChild(leaves1);

        // Leaves (Green Cone) - Layer 2 (Top/Narrow)
        const leaves2 = document.createElement('a-cone');
        leaves2.setAttribute('radius-bottom', 2 * scaleWidth);
        leaves2.setAttribute('radius-top', 0);
        leaves2.setAttribute('height', 2.5 * scaleHeight);
        leaves2.setAttribute('color', '#388E3C'); // Slightly lighter green
        leaves2.setAttribute('position', `0 ${4.5 * scaleHeight} 0`);
        treeEntity.appendChild(leaves2);

        // Append to scene
        this.el.appendChild(treeEntity);
    }
});
