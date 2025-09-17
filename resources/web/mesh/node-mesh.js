import { Billboard } from "/mesh/billboard-mesh.js";
import { TextSprite } from "/mesh/text-mesh.js";

export class NodeMesh {
    constructor(node, state) {
        this.mesh = this.build(node, state);
        this.children = node.mesh;
    }

    resize(size) {
        this.mesh.scale.set(size,size)
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

        const nodeSize = node.radius * state.baseRadius;

        const parts = node.id.split('.');
        const partsCount = parts.length;
        const shouldShowText = partsCount <= state.text.hiddenDepthRange;
        const textSize = 1 / Math.pow(2, parts.length);
        const text = state.text.textFormatter(parts);

        node.mesh = {
            group: group,
            billboard: new Billboard(nodeSize, node.color).mesh,
            text: shouldShowText ? new TextSprite(text, textSize, state.text).mesh : null,
        };
        if (node.mesh.text) {
            node.mesh.billboard = null;
        }

        Object.entries(node.mesh).forEach(([key, value]) => {
            if (value && value !== group) group.add(value);
        });

        return group;
    }
}
