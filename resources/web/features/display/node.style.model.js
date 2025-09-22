import {NodeMeshModel} from "/display/mesh/node.mesh.model.js";

export class NodeStyle {
    constructor() {
        this.mesh = {
            baseRadius: 12.0,
            isVisible: true,
            colorGroupDepthRange: 2,
            size: 'imported',
            color: 'group',
        }
        this.text = {
            isVisible: true,
            hiddenDepthRange: 3,
            scaling: 2.0,
            padding: 2,
            fontSize: 64,
            fontFamily: 'Arial',
            textColor: 'white',
            textOffsetY: 10,
            textFormatter: (parts) => {
                if (!Array.isArray(parts) || parts.length === 0) return '';
                if (parts.length === 1) return parts[0];
                // if (parts.length === 2) return parts.join('.');
                return parts.slice(-1);
            }
        };
    }

    getMesh(node, position) {
        return new NodeMeshModel(node, this, position).mesh;
    }

    getLabel(node) {
        let infos = '';
        if (node.infos) {
            infos = JSON.stringify(node.infos, null, 2);
        }
        return `${node.id}<br>\n${infos}`;
    }
}
