import {Billboard} from "/display/mesh/billboard.mesh.model.js";
import {TextSprite} from "/display/mesh/text.sprite.model.js";

export class NodeMeshModel {

    constructor(node, state, position) {
        this.mesh = this.build(node, state, position);
    }

    resize(size) {
        this.mesh.scale.set(size, size)
    }


    build(node, state, position) {
        const group = new THREE.Group();

        //mesh
        const color = node.color;
        const nodeSize = node.radius * state.mesh.baseRadius;
        const degree = node.infos.imports + node.infos.imported;
        const meshVisible = degree > 0 && state.mesh.isVisible;
        const billboard = meshVisible ? new Billboard(nodeSize, color, position).mesh : null;

        //text
        const parts = node.id.split('.');
        const partsCount = parts.length;
        const shouldShowText = partsCount <= state.text.hiddenDepthRange;
        const textSize = 1 / Math.pow(2, parts.length);
        const text = state.text.textFormatter(parts);
        const textMesh = state.text.isVisible && shouldShowText
            ? new TextSprite(text, textSize, state.text, meshVisible)
            : null;

        node.mesh = {
            group: group,
            billboard: billboard,
            text: textMesh === null ? null : textMesh.mesh,
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
