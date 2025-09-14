class GraphUpdaterNodeText {
    constructor(params) {
        this.params = params;
        this.textOffsetY = 10
        this.fontFamily = 'Arial';
        this.textColor = 'white';
    }

    async apply(graph) {
        graph.graph.nodeThreeObjectExtend(true);
        graph.graph.nodeThreeObject(node => {
            const partsCount = node.id.split('.').length;
            const shouldShowText = partsCount === 1 || partsCount === this.params.groupHierarchyDepth;
            if (!shouldShowText) return;
            return this.createTextSprite(node.id);
        });
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

}