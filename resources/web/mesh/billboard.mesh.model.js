export class Billboard {
    static vertexShader = `
attribute vec3 color;

varying vec3 vColor;
varying vec2 vUv;

void main() {
  vUv = uv;
  vColor = color;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

    static fragmentShader = `
varying vec2 vUv;
varying vec3 vColor;

void main() {
  // coordonnées centrées (0,0) au centre du cercle
  vec2 coord = vUv * 2.0 - 1.0;
  float r = length(coord);

  // masque circulaire
  if (r > 1.0) discard;

  // dégradé sphérique : sqrt(1 - r²) simule la courbure d'une sphère
  float sphereGradient = sqrt(1.0 - r * r);

  gl_FragColor = vec4(vColor * sphereGradient, 1.);
}
`;
    static material = new THREE.ShaderMaterial({
        vertexShader: Billboard.vertexShader,
        fragmentShader: Billboard.fragmentShader,
        transparent: true,
        depthTest: true,
        depthWrite: true,
    });

    constructor(size, color) {
        this.mesh = new THREE.Mesh(
            this.geometry(1, color),
            Billboard.material
        );
        this.mesh.userData.isBillboard = true;
        this.resize(size);
    }

    colorize(color) {
        const c = new THREE.Color(color || '#fff');
        const colors = new Float32Array([
            c.r, c.g, c.b,
            c.r, c.g, c.b,
            c.r, c.g, c.b
        ]);
        this.mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    resize(size) {
        this.mesh.scale.set(size, size);
    }

    geometry(size, color) {
        const c = new THREE.Color(color || '#fff');
        const geometry = new THREE.PlaneGeometry(size, size);
        const rgb = [color.r, color.g, color.b];
        const colors = new Float32Array([
            c.r, c.g, c.b,
            c.r, c.g, c.b,
            c.r, c.g, c.b
        ]);
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geometry;
    }
}
