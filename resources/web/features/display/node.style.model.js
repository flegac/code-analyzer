import { MetadataService } from "/metadata/metadata.service.js";
import { NodeMeshModel } from "/display/mesh/node.mesh.model.js";

export class NodeStyle {
    constructor() {
        this.mesh = {
            scaling: 12.0,
            isVisible: true,
            size: null,
            color: 'group',
        }
        this.text = {
            isVisible: true,
            hiddenDepthRange: 3,
            scaling: 1.0,
            padding: 2,
            fontSize: 64,
            fontFamily: 'Arial',
            textColor: 'white',
            textOffsetY: 10,
        };
    }

    textFormatter(parts) {
        if (!Array.isArray(parts) || parts.length === 0) return '';
        if (parts.length === 1) return parts[0];
        if (parts[parts.length - 1].includes('::')) {
            return '::' + parts[parts.length - 1].split('::').slice(-1)
        }
        // if (parts.length === 2) return parts.join('.');
        return parts.slice(-1);
    }

    getMesh(node, position) {
        return new NodeMeshModel(node, this, position).mesh;
    }

    getLabel(node) {
        const infos = MetadataService.singleton.readAll(node.id);
        infos.incoming = infos.incoming.length;
        infos.outgoing = infos.outgoing.length;

        for (const key in infos) {
            if (infos[key] === null || key.startsWith('_')) {
                delete infos[key];
            }
        }

        const infosString = JSON.stringify(infos, null, 2);
        return `${node.id}<br>\n${infosString}`;
    }
}
