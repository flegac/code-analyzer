class GraphNodeRenderer {
    constructor() {
        this.material = new THREE.ShaderMaterial({
            vertexShader: GraphNodeRenderer.vertexShader,
            fragmentShader: GraphNodeRenderer.fragmentShader,
            transparent: true
        });
    }


    apply(graph) {

        const geometry = new THREE.PlaneGeometry(1, 1); // quad orienté vers la caméra
        const colors = new Float32Array([
            1, 1, 1,  // vertex 1
            1, 1, 1,  // vertex 2
            1, 1, 1,  // vertex 3
            1, 1, 1   // vertex 4
        ]);
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const sizes = new Float32Array([20, 20, 20, 20]);
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        graph.nodeThreeObject(node => {
            const geo = geometry.clone();

            const c = new THREE.Color(node.color || '#ffffff');
            const s = node.size || 20;

            // Injecte la couleur
            const colorArray = new Float32Array([
                c.r, c.g, c.b,
                c.r, c.g, c.b,
                c.r, c.g, c.b,
                c.r, c.g, c.b
            ]);
            geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

            // Injecte la taille
            const sizeArray = new Float32Array([s, s, s, s]);
            geo.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

            const mesh = new THREE.Mesh(geo, this.material);
            mesh.userData = {_isBillboard: true};
            mesh.renderOrder = 999;
            node.mesh = mesh;
            return mesh;
        });

        if (!graph._billboardUpdaterStarted) {
            graph._billboardUpdaterStarted = true;

            function updateBillboardOrientation() {
                const camera = graph.camera();
                graph.graphData().nodes.forEach(node => {
                    const obj = node.mesh;
                    if (obj && obj.userData && obj.userData._isBillboard) {
                        obj.lookAt(camera.position);
                    }
                });
                requestAnimationFrame(updateBillboardOrientation);
            }

            updateBillboardOrientation();
        }
    }

    static vertexShader = `
attribute float size;
attribute vec3 color;

varying vec3 vColor;
varying vec2 vUv;

void main() {
  vUv = uv;
  vColor = color;

  vec4 mvPosition = modelViewMatrix * vec4(position * size, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}

`;

    static fragmentShader = `
varying vec2 vUv;
varying vec3 vColor;

void main() {
  vec2 coord = vUv * 2.0 - 1.0;
  float r = length(coord);
  if (r > 1.0) discard;

  float lighting = sqrt(1.0 - r * r);
  gl_FragColor = vec4(vColor * lighting, .75);
}
`;

}
