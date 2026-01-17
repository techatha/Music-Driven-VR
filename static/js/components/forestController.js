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
        this.growthStarted = false;

        // --- SCALING LISTENERS (Existing) ---

        // 1. Growth (Scale Up)
        this.el.addEventListener('start-growth', () => {
            this.growthStarted = true;
            const trees = this.el.querySelectorAll('.forest-tree');
            trees.forEach(tree => {
                if (tree.dataset.targetScale) {
                    const delay = parseFloat(tree.dataset.delay || 0);
                    const duration = parseFloat(tree.dataset.duration || 1000);
                    
                    // Stop any existing scale animation
                    tree.removeAttribute('animation__scale'); 

                    tree.setAttribute('animation__scale', {
                        property: 'scale',
                        to: tree.dataset.targetScale,
                        dur: duration,
                        easing: 'easeOutElastic',
                        delay: delay
                    });
                }
            });
        });

        // 2. Shrink (Scale Down)
        this.el.addEventListener('start-shrink', () => {
            this.growthStarted = false;
            const trees = this.el.querySelectorAll('.forest-tree');
            trees.forEach(tree => {
                const delay = parseFloat(tree.dataset.delay || 0);
                const duration = parseFloat(tree.dataset.duration || 1000);

                tree.removeAttribute('animation__scale');
                
                tree.setAttribute('animation__scale', {
                    property: 'scale',
                    to: '0 0 0',
                    dur: duration,
                    easing: 'easeInElastic',
                    delay: delay
                });
            });
        });

        // --- POSITION LISTENERS (New) ---

        // 3. Raise Tiers (Move trees to their step height)
        this.el.addEventListener('raise-tiers', () => {
            const trees = this.el.querySelectorAll('.forest-tree');
            trees.forEach(tree => {
                const targetY = parseFloat(tree.dataset.tierHeight || 0);
                const x = parseFloat(tree.dataset.posX);
                const z = parseFloat(tree.dataset.posZ);

                // Only animate if there is actually a height difference
                if (targetY > 0) {
                    tree.removeAttribute('animation__pos');
                    tree.setAttribute('animation__pos', {
                        property: 'position',
                        to: `${x} ${targetY} ${z}`,
                        dur: 2000,
                        easing: 'easeInOutQuad'
                    });
                }
            });
        });

        // 4. Lower Tiers (Flatten trees to ground)
        this.el.addEventListener('lower-tiers', () => {
            const trees = this.el.querySelectorAll('.forest-tree');
            trees.forEach(tree => {
                const x = parseFloat(tree.dataset.posX);
                const z = parseFloat(tree.dataset.posZ);
                const currentY = tree.object3D.position.y;

                if (currentY > 0.1) { // Only animate if not already on ground
                    tree.removeAttribute('animation__pos');
                    tree.setAttribute('animation__pos', {
                        property: 'position',
                        to: `${x} 0 ${z}`,
                        dur: 2000,
                        easing: 'easeInOutQuad'
                    });
                }
            });
        });

        // --- GENERATION ---

        // Create Mixin if needed
        if (!document.querySelector('#pine-tree-mixin')) {
            const mixin = document.createElement('a-mixin');
            mixin.setAttribute('id', 'pine-tree-mixin');
            assets.appendChild(mixin);
        }

        // Generate Trees
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

        // CALCULATE Target Height (but do not apply it yet)
        let targetTierHeight = 0;
        if (radius >= 18 && radius < 22) targetTierHeight = 1.5;      
        else if (radius >= 22 && radius < 26) targetTierHeight = 3.0; 
        else if (radius >= 26 && radius < 30) targetTierHeight = 4.5; 
        else if (radius >= 30 && radius < 35) targetTierHeight = 6.0; 
        else targetTierHeight = 0;                                    

        // Tier 4 ends at radius 35. If radius >= 35, it's outside --> Big Tree
        const isBigTree = radius >= 35;
        const baseScale = isBigTree ? this.data.bigScale : this.data.smallScale;

        // Variation multipliers
        const scaleHeight = 1 + (Math.random() * 1.5); 
        const scaleWidth = 1 + (Math.random() * 0.5);  

        // Container for the tree
        const treeEntity = document.createElement('a-entity');
        treeEntity.classList.add('forest-tree');
        
        // INIT AT GROUND LEVEL (Y=0)
        treeEntity.setAttribute('position', `${x} 0 ${z}`);
        
        // Store data for later animations
        treeEntity.dataset.tierHeight = targetTierHeight; // Where it belongs vertically
        treeEntity.dataset.posX = x; // Keep ref to X
        treeEntity.dataset.posZ = z; // Keep ref to Z

        treeEntity.setAttribute('scale', '0 0 0');

        const targetScaleStr = `${baseScale} ${baseScale} ${baseScale}`; // Simplified for example, modify for procedural if needed
        const duration = 1000 + Math.random() * 500;
        const delay = Math.random() * 2000;

        if (this.data.treeModel) {
            // --- 3D MODEL MODE ---
            treeEntity.setAttribute('gltf-model', this.data.treeModel);
            treeEntity.setAttribute('rotation', `0 ${Math.random() * 360} 0`);

            const modelMult = 0.125;
            const finalScaleX = baseScale * scaleWidth * modelMult;
            const finalScaleY = baseScale * scaleHeight * modelMult;
            const finalScaleZ = baseScale * scaleWidth * modelMult;
            const finalTargetScale = `${finalScaleX} ${finalScaleY} ${finalScaleZ}`;

            treeEntity.addEventListener('model-loaded', () => {
                const mesh = treeEntity.getObject3D('mesh');
                if (mesh) {
                    mesh.traverse((node) => {
                        if (node.isMesh) {
                            node.material.transparent = false; 
                            node.material.alphaTest = 0.5;     
                            node.material.depthWrite = true;   
                            node.material.needsUpdate = true;
                        }
                    });
                }

                treeEntity.dataset.targetScale = finalTargetScale;
                treeEntity.dataset.delay = delay;
                treeEntity.dataset.duration = duration;

                if (this.data.autoStart || this.growthStarted) {
                    treeEntity.setAttribute('animation__scale', {
                        property: 'scale',
                        to: finalTargetScale,
                        dur: duration,
                        easing: 'easeOutElastic',
                        delay: delay
                    });
                }
            });

        } else {
            // --- PROCEDURAL MODE ---
            treeEntity.dataset.targetScale = targetScaleStr;
            treeEntity.dataset.delay = delay;
            treeEntity.dataset.duration = duration;

            if (this.data.autoStart || this.growthStarted) {
                treeEntity.setAttribute('animation__scale', {
                    property: 'scale',
                    to: targetScaleStr,
                    dur: duration,
                    easing: 'easeOutElastic',
                    delay: delay
                });
            }

            // Trunk
            const trunk = document.createElement('a-cylinder');
            trunk.setAttribute('radius', 0.5 * scaleWidth);
            trunk.setAttribute('height', 2 * scaleHeight);
            trunk.setAttribute('color', '#5D4037');
            trunk.setAttribute('position', `0 ${1 * scaleHeight} 0`);
            treeEntity.appendChild(trunk);

            // Leaves 1
            const leaves1 = document.createElement('a-cone');
            leaves1.setAttribute('radius-bottom', 2.5 * scaleWidth);
            leaves1.setAttribute('radius-top', 0);
            leaves1.setAttribute('height', 3 * scaleHeight);
            leaves1.setAttribute('color', '#2E7D32');
            leaves1.setAttribute('position', `0 ${3 * scaleHeight} 0`);
            treeEntity.appendChild(leaves1);

            // Leaves 2
            const leaves2 = document.createElement('a-cone');
            leaves2.setAttribute('radius-bottom', 2 * scaleWidth);
            leaves2.setAttribute('radius-top', 0);
            leaves2.setAttribute('height', 2.5 * scaleHeight);
            leaves2.setAttribute('color', '#388E3C');
            leaves2.setAttribute('position', `0 ${4.5 * scaleHeight} 0`);
            treeEntity.appendChild(leaves2);
        }

        this.el.appendChild(treeEntity);
    }
});