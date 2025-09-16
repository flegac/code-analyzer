class DisplayNodeUpdater {
    constructor(state) {
        this._bilboardMaterial = new THREE.ShaderMaterial({
            vertexShader: DisplayNodeUpdater.vertexShader,
            fragmentShader: DisplayNodeUpdater.fragmentShader,
            transparent: true,
        });
        this._bilboardGeometry = this.bilboardGeometry();
        this._hitboxMaterial = new THREE.MeshBasicMaterial({visible: false});
        this._hitboxGeometry = new THREE.PlaneGeometry(1, 1);

        this.state = state;
        this.textOffsetY = 10
        this.fontFamily = 'Arial';
        this.textColor = 'white';
    }

    apply(graph) {
        graph.nodeThreeObject(node => {
            const group = new THREE.Group();
            group.userData = {
                _isBillboard: true,
                nodeRef: node,
            }


            node.mesh = {
                group: group,
                billboard: this.createBillboard(node),
                hitbox: this.createHitbox(node),
                text: this.createTextSprite(node),
            };
            if( node.mesh.text) {
                node.mesh.billboard = null;
                node.mesh.hitbox = null;
            }

            Object.entries(node.mesh).forEach(([key, value]) => {
                if (value && value !== group) group.add(value);
            });

            return group;
        });

        if (!graph._billboardUpdaterStarted) {
            graph._billboardUpdaterStarted = true;

            function updateBillboardOrientation() {
                const camera = graph.camera();
                graph.graphData().nodes.forEach(node => {
                    if (node.mesh) {
                        node.mesh.group.lookAt(camera.position);
                    }
                });
                requestAnimationFrame(updateBillboardOrientation);
            }

            updateBillboardOrientation();
        }
    }

    createHitbox(node) {
        const size = node.radius;
        const mesh = new THREE.Mesh(this._hitboxGeometry.clone(), this._hitboxMaterial);
        mesh.userData.nodeRef = node;
        mesh.scale.set(size, size);
        return mesh;
    }

    createBillboard(node) {
        const geo = this._bilboardGeometry.clone();
        const c = new THREE.Color(node.color || '#fff');
        const size = node.radius;
        const colorArray = new Float32Array([
            c.r, c.g, c.b,
            c.r, c.g, c.b,
            c.r, c.g, c.b,
            c.r, c.g, c.b
        ]);
        geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        const sizeArray = new Float32Array([size, size, size, size]);
        geo.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
        const mesh = new THREE.Mesh(geo, this._bilboardMaterial);
        return mesh;
    }

    createTextSprite(node) {
        const parts = node.id.split('.');
        const partsCount = parts.length;
        const shouldShowText = partsCount === 1 || partsCount <= this.state.groupHierarchyDepth;
        if (!shouldShowText) return null;

        const size = 5 / Math.pow(2, parts.length);
        const text = formatPath(parts);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        const fontSize = this.state.fontSize;
        const scaleFactor = this.state.scaleFactor * size;

        context.font = `${fontSize}px ${this.fontFamily}`;
        const textWidth = context.measureText(text).width;
        const textHeight = fontSize + 12;

        canvas.width = textWidth;
        canvas.height = textHeight;

        context.font = `${fontSize}px ${this.fontFamily}`;
        context.fillStyle = this.textColor;
        context.textBaseline = 'top';
        context.fillText(text, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        const mesh = new THREE.Sprite(material);

        mesh.scale.set(textWidth * scaleFactor, textHeight * scaleFactor, 1);
        // mesh.position.set(0, this.textOffsetY, 0);
        return mesh;
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
        const sizes = new Float32Array([1, 1, 1, 1]);
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

function formatPath(parts) {
    if (!Array.isArray(parts) || parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts.join('.');

    const res = parts.slice(-2).join('.');
    return `_.${res}`;
}
