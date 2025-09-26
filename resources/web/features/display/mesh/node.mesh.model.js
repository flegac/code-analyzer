import { Billboard } from "/display/mesh/billboard.mesh.model.js";
import { TextSprite } from "/display/mesh/text.sprite.model.js";

export class NodeMeshModel {

    constructor(node, state, position) {
        this.mesh = this.build(node, state, position);
    }

    resize(size) {
        this.mesh.scale.set(size, size)
    }

    build(node, state, position) {
        const group = new THREE.Group();
        const nodeId = node.id;

        const isModule = node.read('category') == 'Module';

        //mesh
        const color = node.read('color');
        const nodeSize = node.read('radius') * state.mesh.scaling;
        const degree = node.read('outgoing').length + node.read('incoming').length;
        const meshVisible = (degree > 0) && state.mesh.isVisible;
        const billboard = meshVisible ? new Billboard(nodeSize, color, position) : null;

        //text
        const parts = nodeId.split('.');
        const partsCount = parts.length;
        const shouldShowText = partsCount <= state.text.hiddenDepthRange || (!isModule);
        const textSize = isModule ? 1 / Math.pow(2, parts.length) : .25;

        const text = state.textFormatter(parts);
        const textMesh = state.text.isVisible && shouldShowText
            ? new TextSprite(text, textSize / state.text.fontSize, state.text, meshVisible)
            : null;

        const meshes = {
            group: this,
            billboard: billboard,
            text: textMesh === null ? null : textMesh,
        };
        node.write('_meshes', meshes);

        Object.entries(meshes).forEach(([key, value]) => {
            if (value && value !== group && value.mesh) group.add(value.mesh);
        });

        return group;
    }
}
