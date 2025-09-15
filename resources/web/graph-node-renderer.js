class GraphNodeRenderer {
    constructor(params) {
        this.material = new THREE.ShaderMaterial({
            vertexShader: GraphNodeRenderer.vertexShader,
            fragmentShader: GraphNodeRenderer.fragmentShader,
            transparent: true
        });
        this.geometry = this.bilboardGeometry();

        this.params = params;
        this.textOffsetY = 10
        this.fontFamily = 'Arial';
        this.textColor = 'white';
    }


    apply(graph) {
        graph.nodeThreeObject(node => {
            const group = new THREE.Group();

            const billboard = this.createBillboard(node);
            group.add(billboard);
            node.my_billboard = billboard;

            const partsCount = node.id.split('.').length;
            const shouldShowText = partsCount === 1 || partsCount === this.params.groupHierarchyDepth;

            if (shouldShowText) {
                const textSprite = this.createTextSprite(node.id);
                textSprite.position.set(0, 25, 0); // positionne le texte au-dessus du billboard
                group.add(textSprite);
                node.my_textSprite = textSprite;
            }

            return group;
        });

        if (!graph._billboardUpdaterStarted) {
            graph._billboardUpdaterStarted = true;

            function updateBillboardOrientation() {
                const camera = graph.camera();
                graph.graphData().nodes.forEach(node => {
                    const obj = node.my_billboard;
                    if (obj && obj.userData && obj.userData._isBillboard) {
                        obj.lookAt(camera.position);
                    }
                });
                requestAnimationFrame(updateBillboardOrientation);
            }

            updateBillboardOrientation();
        }
    }

    createBillboard(node) {
        const geo = this.geometry.clone();

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
        return mesh;
    }

    createTextSprite(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const fontSize = this.params.fontSize;
        const scaleFactor = this.params.scaleFactor;

        context.font = `${fontSize}px ${this.fontFamily}`;
        const textWidth = context.measureText(text).width;
        const textHeight = fontSize + 12;

        canvas.width = textWidth;
        canvas.height = textHeight;

        context.font = `${fontSize}px ${this.fontFamily}`;
        context.fillStyle = this.textColor;
        context.fillText(text, 0, fontSize * .75);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({map: texture, transparent: true});
        const sprite = new THREE.Sprite(material);

        sprite.scale.set(textWidth * scaleFactor, textHeight * scaleFactor, 1);
        sprite.position.set(0, this.textOffsetY, 0);

        return sprite;
    }

    bilboardGeometry() {

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
        return geometry;
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
  gl_FragColor = vec4(vColor * lighting, .5);
}
`;

}
