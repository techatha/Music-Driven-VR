AFRAME.registerShader('gradient-shader', {
    schema: {
        topColor: { type: 'color', default: '#87CEEB', is: 'uniform' },
        bottomColor: { type: 'color', default: '#E6F2FF', is: 'uniform' },
        offset: { type: 'float', default: 400, is: 'uniform' }, // For Sky (Spherical)
        exponent: { type: 'float', default: 0.6, is: 'uniform' }, // For Sky (Spherical)
        minY: { type: 'float', default: -0.4, is: 'uniform' },    // For Objects (Linear)
        maxY: { type: 'float', default: 0.4, is: 'uniform' },     // For Objects (Linear)
        opacity: { type: 'float', default: 1.0, is: 'uniform' },
        emissive: { type: 'color', default: '#000000', is: 'uniform' },
        emissiveIntensity: { type: 'float', default: 0.0, is: 'uniform' },
        useLocal: { type: 'float', default: 0.0, is: 'uniform' } // 0.0 = World(Sky), 1.0 = Local(Object)
    },

    vertexShader: `
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    void main() {
      vLocalPosition = position;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

    fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    uniform float minY;
    uniform float maxY;
    uniform float opacity;
    uniform vec3 emissive;
    uniform float emissiveIntensity;
    uniform float useLocal;
    
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    
    void main() {
      float t = 0.0;

      if (useLocal > 0.5) {
          // Linear Gradient for Objects (scale 0 to 1 based on Y)
          // Clamp to avoid colors going weird outside range
          t = clamp((vLocalPosition.y - minY) / (maxY - minY), 0.0, 1.0);
      } else {
          // Spherical Gradient for Sky
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          t = max(pow(max(h, 0.0), exponent), 0.0);
      }
      
      // Calculate Gradient Color
      vec3 gradientColor = mix(bottomColor, topColor, t);
      
      // Add Emission
      vec3 finalColor = gradientColor + (emissive * emissiveIntensity);
      
      gl_FragColor = vec4(finalColor, opacity);
    }
  `
});
