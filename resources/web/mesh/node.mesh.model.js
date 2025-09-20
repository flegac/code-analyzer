import {Billboard} from "/mesh/billboard.mesh.model.js";
import {TextSprite} from "/mesh/text.sprite.model.js";

export class NodeMeshModel {
    constructor(node, state) {
        this.mesh = this.build(node, state);
        this.children = node.mesh;
    }

    resize(size) {
        this.mesh.scale.set(size, size)
    }

    colorize(color) {
        this.children.billboard.colorize(color)
    }

    build(node, state) {
        const group = new THREE.Group();
        group.userData = {
            _isBillboard: true,
            nodeRef: node,
        };

        //mesh
        const color = node.color;
        const nodeSize = node.radius * state.mesh.baseRadius;
        const degree = node.infos.imports + node.infos.imported;
        const meshVisible = degree > 0 && state.mesh.isVisible;
        const billboard = meshVisible ? new Billboard(nodeSize, color).mesh : null;

        //text
        const parts = node.id.split('.');
        const partsCount = parts.length;
        const shouldShowText = partsCount <= state.text.hiddenDepthRange;
        const textSize = 1 / Math.pow(2, parts.length);
        const text = state.text.textFormatter(parts);
        const textMesh = state.text.isVisible && shouldShowText ? new TextSprite(text, textSize, state.text, meshVisible).mesh : null

        node.mesh = {
            group: group,
            billboard: billboard,
            text: textMesh,
        };
        // if (node.mesh.text) {
        //     node.mesh.billboard = null;
        // }

        Object.entries(node.mesh).forEach(([key, value]) => {
            if (value && value !== group) group.add(value);
        });

        return group;
    }
}
