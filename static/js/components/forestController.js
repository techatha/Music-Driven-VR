// Register a component to generate the forest
AFRAME.registerComponent('forest-generator', {
    schema: {
        count: { type: 'int', default: 100 },
        minRadius: { type: 'number', default: 20 },
        maxRadius: { type: 'number', default: 100 },
        smallScale: { type: 'number', default: 1.0 },
        bigScale: { type: 'number', default: 2.0 },
        treeModel: { type: 'string', default: '' },
        autoStart: { type: 'boolean', default: true }
    },

    init: function () {
        const scene = this.el.sceneEl;
        const assets = document.querySelector('a-assets');

        // State for manual trigger
        this.growthStarted = false;

        // Listener for manual trigger (Growth)
        this.el.addEventListener('start-growth', () => {
            this.growthStarted = true;
            const trees = this.el.querySelectorAll('.forest-tree');
            trees.forEach(tree => {
                if (tree.dataset.targetScale) {
                    const delay = parseFloat(tree.dataset.delay || 0);
                    const duration = parseFloat(tree.dataset.duration || 1000);

                    tree.removeAttribute('animation');
                    tree.setAttribute('animation', {
                        property: 'scale',
                        to: tree.dataset.targetScale,
                        dur: duration,
                        easing: 'easeOutElastic',
                        delay: delay
                    });
                }
            });
        });

        // Listener for manual trigger (Shrink/Exit)
        this.el.addEventListener('start-shrink', () => {
            this.growthStarted = false; // Reset state
            const trees = this.el.querySelectorAll('.forest-tree');
            trees.forEach(tree => {
                const delay = parseFloat(tree.dataset.delay || 0);
                const duration = parseFloat(tree.dataset.duration || 1000);

                tree.removeAttribute('animation');
                tree.setAttribute('animation', {
                    property: 'scale',
                    to: '0 0 0',
                    dur: duration,
                    easing: 'easeInElastic',
                    delay: delay
                });
            });
        });

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
        treeEntity.classList.add('forest-tree');
        treeEntity.setAttribute('position', `${x} ${y} ${z}`);

        // Apply Base Scale + Variation
        // We apply baseScale to the entity's scale property so it affects everything uniformly
        // Initial scale 0 for animation
        treeEntity.setAttribute('scale', '0 0 0');

        // Animation attributes
        const targetScale = `${baseScale} ${baseScale} ${baseScale}`;
        const duration = 1000 + Math.random() * 500; // 1000ms - 1500ms
        const delay = Math.random() * 2000; // 0ms - 2000ms delay

        if (this.data.treeModel) {
            // 3D MODEL MODE
            treeEntity.setAttribute('gltf-model', this.data.treeModel);

            // Random rotation
            treeEntity.setAttribute('rotation', `0 ${Math.random() * 360} 0`);

            // For imported models, we usually need to adjust scale significantly 
            // depending on the source units. We use the calculated height/width as multipliers.
            // Adjusting this base multiplier might be needed if trees are too small/big.
            const modelMult = 0.125;
            const finalScaleX = baseScale * scaleWidth * modelMult;
            const finalScaleY = baseScale * scaleHeight * modelMult;
            const finalScaleZ = baseScale * scaleWidth * modelMult;

            const targetScaleStr = `${finalScaleX} ${finalScaleY} ${finalScaleZ}`;

            // Animate scale from 0
            // Wait for model to load before animating, and fix materials
            treeEntity.addEventListener('model-loaded', () => {

                // Fix Materials for correct occlusion (user request)
                const mesh = treeEntity.getObject3D('mesh');
                if (mesh) {
                    mesh.traverse((node) => {
                        if (node.isMesh) {
                            // Optimal settings for trees (alpha cutout):
                            node.material.transparent = false; // Treat as opaque for sorting
                            node.material.alphaTest = 0.5;     // Cut out transparent pixels
                            node.material.depthWrite = true;   // Write depth for solid parts
                            node.material.needsUpdate = true;
                        }
                    });
                }

                // Store target scale for later (or now)
                treeEntity.dataset.targetScale = targetScaleStr;
                treeEntity.dataset.delay = delay;
                treeEntity.dataset.duration = duration;

                if (this.data.autoStart || this.growthStarted) {
                    // Animate showing up
                    treeEntity.setAttribute('animation', {
                        property: 'scale',
                        to: targetScaleStr,
                        dur: duration,
                        easing: 'easeOutElastic',
                        delay: delay
                    });
                }
            });

        } else {
            // PROCEDURAL MODE (Fallback)

            // Animation for procedural (standard uniform scale)
            const targetScaleStr = `${baseScale} ${baseScale} ${baseScale}`;
            treeEntity.dataset.targetScale = targetScaleStr;
            treeEntity.dataset.delay = delay;
            treeEntity.dataset.duration = duration;

            if (this.data.autoStart || this.growthStarted) {
                treeEntity.setAttribute('animation', {
                    property: 'scale',
                    to: targetScaleStr,
                    dur: duration,
                    easing: 'easeOutElastic',
                    delay: delay
                });
            }


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
        }

        // Append to scene
        this.el.appendChild(treeEntity);
    }
});
