/* ──────────────────────────────────────────────────────────────────────
 *  procedural-building  –  A‑Frame component
 *  Generates a high‑detail skyscraper entirely from Three.js geometry
 *  with a grid of individually controllable lit windows.
 * ────────────────────────────────────────────────────────────────────── */

AFRAME.registerComponent('procedural-building', {

    schema: {
        floors: { type: 'number', default: 25 },
        floorHeight: { type: 'number', default: 3 },
        width: { type: 'number', default: 12 },
        depth: { type: 'number', default: 12 },
        windowCols: { type: 'number', default: 6 },
        windowColor: { type: 'color', default: '#FFDD88' },
        windowIntensity: { type: 'number', default: 1.5 },
        litRatio: { type: 'number', default: 0.7 }
    },

    /* ── lifecycle ──────────────────────────────────────────────────── */

    init() {
        const THREE = AFRAME.THREE;
        const d = this.data;

        this.windowMeshes = [];          // every window pane (for runtime control)
        this.group = new THREE.Group();  // root group for the whole building

        /* ── materials ──────────────────────────────────────────────── */
        const facadeMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#2a2a30'),
            roughness: 0.85,
            metalness: 0.15
        });

        const ledgeMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#3a3a42'),
            roughness: 0.7,
            metalness: 0.2
        });

        const frameMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#1a1a1e'),
            roughness: 0.6,
            metalness: 0.3
        });

        const roofMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#222228'),
            roughness: 0.9,
            metalness: 0.1
        });

        const antennaMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#888888'),
            roughness: 0.4,
            metalness: 0.7
        });

        const entranceMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#111114'),
            roughness: 0.5,
            metalness: 0.4
        });

        const totalHeight = d.floors * d.floorHeight;

        /* ── 1. Main body ───────────────────────────────────────────── */
        const bodyGeo = new THREE.BoxGeometry(d.width, totalHeight, d.depth);
        const body = new THREE.Mesh(bodyGeo, facadeMat);
        body.position.y = totalHeight / 2;
        this.group.add(body);

        /* ── 2. Window grid  (4 facades) ────────────────────────────── */
        const windowWidth = (d.width * 0.7) / d.windowCols;
        const windowHeight = d.floorHeight * 0.55;
        const windowDepth = 0.08;                       // slight inset thickness
        const windowGeo = new THREE.BoxGeometry(windowWidth * 0.85, windowHeight, windowDepth);

        // facade definitions:  normal axis, sign, and which dimension to spread along
        const facades = [
            { axis: 'z', sign: 1, spreadAxis: 'x', spreadSize: d.width, facadeDepth: d.depth },  // front
            { axis: 'z', sign: -1, spreadAxis: 'x', spreadSize: d.width, facadeDepth: d.depth },  // back
            { axis: 'x', sign: 1, spreadAxis: 'z', spreadSize: d.depth, facadeDepth: d.width },  // right
            { axis: 'x', sign: -1, spreadAxis: 'z', spreadSize: d.depth, facadeDepth: d.width }   // left
        ];

        const windowColor = new THREE.Color(d.windowColor);

        for (const f of facades) {
            const cols = Math.max(1, Math.floor((f.spreadSize * 0.7) / windowWidth));
            const totalWindowsWidth = cols * windowWidth;
            const startOffset = -totalWindowsWidth / 2 + windowWidth / 2;

            for (let floor = 0; floor < d.floors; floor++) {
                // skip ground floor — that will be the entrance
                if (floor === 0) continue;

                const yCenter = floor * d.floorHeight + d.floorHeight * 0.55;

                for (let col = 0; col < cols; col++) {
                    const lit = Math.random() < d.litRatio;

                    const mat = new THREE.MeshStandardMaterial({
                        color: lit ? new THREE.Color('#d4e4ff') : new THREE.Color('#0e0e12'),
                        emissive: lit ? windowColor.clone() : new THREE.Color('#000000'),
                        emissiveIntensity: lit ? d.windowIntensity : 0,
                        roughness: 0.1,
                        metalness: 0.9
                    });

                    const pane = new THREE.Mesh(windowGeo, mat);

                    // position along spread axis
                    const spreadPos = startOffset + col * windowWidth;

                    if (f.axis === 'z') {
                        pane.position.set(
                            spreadPos,
                            yCenter,
                            f.sign * (f.facadeDepth / 2 + 0.02)
                        );
                    } else {
                        pane.position.set(
                            f.sign * (f.facadeDepth / 2 + 0.02),
                            yCenter,
                            spreadPos
                        );
                        pane.rotation.y = Math.PI / 2;
                    }

                    pane.userData.lit = lit;
                    this.group.add(pane);
                    this.windowMeshes.push(pane);
                }
            }
        }

        /* ── 3. Window frames / mullions (horizontal bands per floor) ── */
        for (let floor = 1; floor <= d.floors; floor++) {
            const bandY = floor * d.floorHeight;
            const bandGeo = new THREE.BoxGeometry(d.width + 0.1, 0.12, d.depth + 0.1);
            const band = new THREE.Mesh(bandGeo, frameMat);
            band.position.y = bandY;
            this.group.add(band);
        }

        /* ── 4. Horizontal ledges every 5 floors ───────────────────── */
        for (let floor = 5; floor < d.floors; floor += 5) {
            const ledgeY = floor * d.floorHeight;
            const ledgeGeo = new THREE.BoxGeometry(d.width + 0.8, 0.35, d.depth + 0.8);
            const ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
            ledge.position.y = ledgeY;
            this.group.add(ledge);
        }

        /* ── 5. Entrance recess (ground floor) ─────────────────────── */
        const entranceWidth = d.width * 0.3;
        const entranceHeight = d.floorHeight * 1.8;
        const entranceDepthVal = 1.2;
        const entranceGeo = new THREE.BoxGeometry(entranceWidth, entranceHeight, entranceDepthVal);
        const entrance = new THREE.Mesh(entranceGeo, entranceMat);
        entrance.position.set(0, entranceHeight / 2, d.depth / 2 + 0.01);
        this.group.add(entrance);

        // entrance awning
        const awningGeo = new THREE.BoxGeometry(entranceWidth + 1.5, 0.15, 1.8);
        const awning = new THREE.Mesh(awningGeo, ledgeMat);
        awning.position.set(0, entranceHeight + 0.1, d.depth / 2 + 0.6);
        this.group.add(awning);

        // entrance light
        const entranceLightGeo = new THREE.BoxGeometry(entranceWidth * 0.6, 0.08, 0.08);
        const entranceLightMat = new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            emissive: new THREE.Color('#FFEECC'),
            emissiveIntensity: 2.0
        });
        const entranceLight = new THREE.Mesh(entranceLightGeo, entranceLightMat);
        entranceLight.position.set(0, entranceHeight - 0.2, d.depth / 2 + 0.4);
        this.group.add(entranceLight);

        /* ── 6. Roof features ──────────────────────────────────────── */
        // mechanical penthouse
        const phW = d.width * 0.4;
        const phH = d.floorHeight * 0.8;
        const phD = d.depth * 0.4;
        const pentGeo = new THREE.BoxGeometry(phW, phH, phD);
        const pent = new THREE.Mesh(pentGeo, roofMat);
        pent.position.y = totalHeight + phH / 2;
        this.group.add(pent);

        // roof ledge
        const roofLedgeGeo = new THREE.BoxGeometry(d.width + 0.6, 0.4, d.depth + 0.6);
        const roofLedge = new THREE.Mesh(roofLedgeGeo, ledgeMat);
        roofLedge.position.y = totalHeight;
        this.group.add(roofLedge);

        // antenna spire
        const antennaGeo = new THREE.CylinderGeometry(0.08, 0.15, d.floorHeight * 3, 8);
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.y = totalHeight + phH + (d.floorHeight * 3) / 2;
        this.group.add(antenna);

        // blinking red light at antenna tip
        const tipGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const tipMat = new THREE.MeshStandardMaterial({
            color: '#FF0000',
            emissive: new THREE.Color('#FF0000'),
            emissiveIntensity: 3.0
        });
        this.antennaLight = new THREE.Mesh(tipGeo, tipMat);
        this.antennaLight.position.y = totalHeight + phH + d.floorHeight * 3 + 0.15;
        this.group.add(this.antennaLight);

        /* ── 7. Corner pillars (vertical accent strips) ─────────────── */
        const pillarGeo = new THREE.BoxGeometry(0.4, totalHeight + 0.5, 0.4);
        const corners = [
            [d.width / 2, 0, d.depth / 2],
            [-d.width / 2, 0, d.depth / 2],
            [d.width / 2, 0, -d.depth / 2],
            [-d.width / 2, 0, -d.depth / 2]
        ];
        for (const [cx, , cz] of corners) {
            const pillar = new THREE.Mesh(pillarGeo, ledgeMat);
            pillar.position.set(cx, (totalHeight + 0.5) / 2, cz);
            this.group.add(pillar);
        }

        /* ── attach to entity ──────────────────────────────────────── */
        this.el.setObject3D('building', this.group);

        /* ── event listeners ───────────────────────────────────────── */
        this.el.addEventListener('set-window-color', e => this._setWindowColor(e.detail));
        this.el.addEventListener('set-window-intensity', e => this._setWindowIntensity(e.detail));
        this.el.addEventListener('toggle-all-windows', e => this._toggleAll(e.detail));
        this.el.addEventListener('randomize-windows', e => this._randomize(e.detail));

        /* kick off the antenna blink */
        this._blinkPhase = 0;
    },

    tick(t) {
        // blink the antenna light (1 Hz)
        if (this.antennaLight) {
            this._blinkPhase = (this._blinkPhase || 0);
            const on = Math.sin(t * 0.003) > 0.3;
            this.antennaLight.material.emissiveIntensity = on ? 3.0 : 0.0;
        }
    },

    remove() {
        this.el.removeObject3D('building');
    },

    /* ── runtime helpers ───────────────────────────────────────────── */

    _setWindowColor(detail) {
        const c = new AFRAME.THREE.Color(detail.color || '#FFDD88');
        for (const w of this.windowMeshes) {
            if (w.userData.lit) {
                w.material.emissive.copy(c);
            }
        }
    },

    _setWindowIntensity(detail) {
        const intensity = detail.intensity != null ? detail.intensity : 1.5;
        for (const w of this.windowMeshes) {
            if (w.userData.lit) {
                w.material.emissiveIntensity = intensity;
            }
        }
    },

    _toggleAll(detail) {
        const on = !!detail.on;
        const windowColor = new AFRAME.THREE.Color(this.data.windowColor);
        for (const w of this.windowMeshes) {
            w.userData.lit = on;
            w.material.emissive = on ? windowColor.clone() : new AFRAME.THREE.Color('#000000');
            w.material.emissiveIntensity = on ? this.data.windowIntensity : 0;
            w.material.color = on
                ? new AFRAME.THREE.Color('#d4e4ff')
                : new AFRAME.THREE.Color('#0e0e12');
        }
    },

    _randomize(detail) {
        const ratio = detail.ratio != null ? detail.ratio : this.data.litRatio;
        const windowColor = new AFRAME.THREE.Color(this.data.windowColor);
        for (const w of this.windowMeshes) {
            const lit = Math.random() < ratio;
            w.userData.lit = lit;
            w.material.emissive = lit ? windowColor.clone() : new AFRAME.THREE.Color('#000000');
            w.material.emissiveIntensity = lit ? this.data.windowIntensity : 0;
            w.material.color = lit
                ? new AFRAME.THREE.Color('#d4e4ff')
                : new AFRAME.THREE.Color('#0e0e12');
        }
    }
});
