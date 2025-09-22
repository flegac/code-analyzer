export class TextSprite {
    constructor(text, baseSize, state, hasMesh) {
        this.state = state;
        this.baseSize = baseSize;
        [this.mesh, this.aspect] = this.createTextSprite(text, state);
        this.resize(state.scaling)

        const offset = hasMesh ? state.textOffsetY : 0
        this.mesh.position.set(0, offset, 10);
    }

    resize(size) {
        const scaling = size * this.baseSize * this.state.fontSize * this.state.scaling;
        this.mesh.scale.set(this.aspect * scaling, scaling);
        return this;
    }

    createTextSprite(text, state) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        const fontSize = state.fontSize;

        context.font = `${fontSize}px ${state.fontFamily}`;
        const textWidth = context.measureText(text).width;
        const textHeight = fontSize + 2 * state.padding;

        const aspect = textWidth / textHeight;

        canvas.width = textWidth;
        canvas.height = textHeight;

        context.font = `${fontSize}px ${state.fontFamily}`;
        context.fillStyle = state.textColor;
        context.textBaseline = 'top';
        context.fillText(text, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        const mesh = new THREE.Sprite(material);
        mesh.position.set(0, state.textOffsetY, 1);
        return [mesh, aspect];
    }
}
