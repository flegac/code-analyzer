import {V} from "../display/visual.service.js";

export class TextSprite {
    constructor(node, baseSize) {
        this.baseSize = baseSize;
        [this.mesh, this.aspect] = this.createTextSprite(node);

        const hasMesh = V.visibleMesh(node);


        const offset = hasMesh ? V.state.mesh.scaling : 0
        this.mesh.position.set(0, offset, 10);

        this.resize(V.state.mesh.scaling)
    }

    resize(size) {
        const scaling = size * this.baseSize * 100;
        this.mesh.scale.set(this.aspect * scaling, scaling);
        return this;
    }

    createTextSprite(node) {
        const text = V.textFormatter(node.id.split('.'));

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        const config = V.state.text;

        const fontSize =config.fontSize;

        context.font = `${fontSize}px ${V.state.text.fontFamily}`;
        const textWidth = context.measureText(text).width;
        const textHeight = fontSize + 2 *config.padding;

        const aspect = textWidth / textHeight;

        canvas.width = textWidth;
        canvas.height = textHeight;

        context.font = `${fontSize}px ${V.state.text.fontFamily}`;
        context.fillStyle =config.textColor;
        context.textBaseline = 'top';
        context.fillText(text, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        const mesh = new THREE.Sprite(material);
        mesh.position.set(0, config.textOffsetY, 1);
        return [mesh, aspect];
    }
}
