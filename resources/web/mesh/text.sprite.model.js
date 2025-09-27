import {StyleService} from "../display/style.service.js";

export class TextSprite {
    constructor(node, baseSize) {
        this.baseSize = baseSize;
        [this.mesh, this.aspect] = this.createTextSprite(node);

        const S = StyleService.singleton;
        const hasMesh = S.visibleMesh(node);


        const offset = hasMesh ? S.mesh.scaling : 0
        this.mesh.position.set(0, offset, 10);

        this.resize(S.mesh.scaling)
    }

    resize(size) {
        const S = StyleService.singleton;

        const scaling = size * this.baseSize;
        this.mesh.scale.set(this.aspect * scaling, scaling);
        return this;
    }

    createTextSprite(node) {
        const S = StyleService.singleton;

        const text = S.textFormatter(node.id.split('.'));

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        const fontSize = S.text.fontSize;

        context.font = `${fontSize}px ${S.text.fontFamily}`;
        const textWidth = context.measureText(text).width;
        const textHeight = fontSize + 2 * S.text.padding;

        const aspect = textWidth / textHeight;

        canvas.width = textWidth;
        canvas.height = textHeight;

        context.font = `${fontSize}px ${S.text.fontFamily}`;
        context.fillStyle = S.text.textColor;
        context.textBaseline = 'top';
        context.fillText(text, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        const mesh = new THREE.Sprite(material);
        mesh.position.set(0, S.text.textOffsetY, 1);
        return [mesh, aspect];
    }
}
