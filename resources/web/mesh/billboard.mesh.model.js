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

    static _material = null;

    static material() {
        if (Billboard._material === null) {
            Billboard._material = new THREE.ShaderMaterial({
                vertexShader: Billboard.vertexShader,
                fragmentShader: Billboard.fragmentShader,
                transparent: true,
                depthTest: true,
                depthWrite: true,
            });
        }
        return Billboard._material;
    }

    constructor(node, target) {
        const color = node.read('color');
        const size = node.read('radius');

        this.mesh = new THREE.Mesh(
            this.geometry(1),
            Billboard.material()
        );
        this.mesh.userData = {isBillboard: true};
        this.mesh.lookAt(target);
        this.redraw(size, color);
    }

    redraw(size = null, color = null) {
        if (size !== null) {
            this.resize(size);
        }
        if (color !== null) {
            this.colorize(color);
        }
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

    geometry(size) {
        const geometry = new THREE.PlaneGeometry(size, size);
        return geometry;
    }

    static startAutoOrientation(sceneProvider, targetProvider) {
        function accept(obj) {
            return obj.visible && obj.userData.isBillboard;
        }

        const loop = () => {
            const target = targetProvider()
            sceneProvider().traverse(obj => {
                if (accept(obj)) {
                    obj.lookAt(target);
                }
            });
            requestAnimationFrame(loop);
        };
        loop();
    }

}
