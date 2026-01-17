AFRAME.registerComponent('sky-controller', {
    schema: {
        startTime: { type: 'string', default: 'night' }
    },

    init: function () {
        this.sky = document.querySelector('a-sky');
        this.sunLight = document.querySelector('a-light[type="directional"]');
        this.ambientLight = document.querySelector('a-light[type="ambient"]');

        // Bind methods
        this.setMorning = this.setMorning.bind(this);
        this.setEvening = this.setEvening.bind(this);
        this.setNight = this.setNight.bind(this);

        // Event Listeners
        this.el.addEventListener('set-morning', this.setMorning);
        this.el.addEventListener('set-evening', this.setEvening);
        this.el.addEventListener('set-night', this.setNight);
    },

    setMorning: function () {
        console.log("Setting Morning...");
        // Bright, foggy morning
        this.updateEnvironment(
            '#87CEEB', // Top Color (SkyBlue)
            '#E6F2FF', // Bottom Color (Light Blue)
            '#E6F2FF', // Fog: Very light blue
            '#FFD700', // Sun: Gold
            '#CCCCCC', // Ambient: Light Grey
            0.8,       // Sun Intensity
            0.001      // Fog Density (Clearer)
        );
    },

    setEvening: function () {
        console.log("Setting Evening...");
        // Warm sunset gradient
        this.updateEnvironment(
            '#4B0082', // Top: Indigo
            '#FF7F50', // Bottom: Coral for sunset look
            '#FFA07A', // Fog: Light Salmon
            '#FF4500', // Sun: OrangeRed
            '#8B4513', // Ambient: SaddleBrown
            0.6,       // Sun Intensity
            0.003      // Fog Density (Thicker)
        );
    },

    setNight: function () {
        console.log("Setting Night...");
        // Dark, moody night
        this.updateEnvironment(
            '#020205', // Top: Deep Black/Blue
            '#050510', // Bottom: Dark Blue
            '#050510', // Fog: Dark
            '#aaccff', // Sun (Moon): Blueish
            '#222222', // Ambient: Dark Grey
            0.6,       // Sun Intensity
            0.002      // Fog Density
        );
    },

    updateEnvironment: function (skyTopColor, skyBottomColor, fogColor, directLightColor, ambientColor, intensity, fogDensity) {
        // 1. Sky Gradient (Shader uniforms)
        if (this.sky) {
            // Check if we are using the gradient shader
            // For now, assume we switch/enforce it
            if (this.sky.getAttribute('material')?.shader === 'gradient-shader') {
                // Already has shader, just animate props
            } else {
                // First time switch, or ensure it's set
                this.sky.setAttribute('material', { shader: 'gradient-shader' });
                // Set initial values so animation has a "from" if needed, or just set them
            }

            // Animate Top Color
            this.sky.setAttribute('animation__topColor', {
                property: 'material.topColor',
                to: skyTopColor,
                dur: 2000,
                easing: 'easeInOutQuad'
            });

            // Animate Bottom Color
            this.sky.setAttribute('animation__bottomColor', {
                property: 'material.bottomColor',
                to: skyBottomColor,
                dur: 2000,
                easing: 'easeInOutQuad'
            });
        }

        // 2. Fog (Scene)
        // Fog doesn't support animation component out-of-the-box easily for sub-properties, 
        // but we can set it. Smooth transition would require a custom tick or a proxy object.
        // For simplicity/robustness, we just set it. 
        // To avoid "pop", we could animate a proxy, but let's start simple.
        this.el.sceneEl.setAttribute('fog', {
            type: 'exponential',
            color: fogColor,
            density: fogDensity
        });

        // 3. Directional Light (Sun/Moon)
        if (this.sunLight) {
            this.sunLight.setAttribute('animation__color', {
                property: 'color',
                to: directLightColor,
                dur: 2000,
                easing: 'easeInOutQuad'
            });
            this.sunLight.setAttribute('animation__intensity', {
                property: 'intensity',
                to: intensity,
                dur: 2000,
                easing: 'easeInOutQuad'
            });
        }

        // 4. Ambient Light
        if (this.ambientLight) {
            this.ambientLight.setAttribute('animation__color', {
                property: 'color',
                to: ambientColor,
                dur: 2000,
                easing: 'easeInOutQuad'
            });
        }
    }
});
