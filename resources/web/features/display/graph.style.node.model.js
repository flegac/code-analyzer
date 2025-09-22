import { GraphStyleService } from "/display/graph.style.service.js";
import { LayoutService } from "/core/layout.service.js";
import { NodeMeshModel } from "/display/mesh/node.mesh.model.js";

export class GraphNodeStyle {
    getMesh(node) {
        return new NodeMeshModel(
            node,
            GraphStyleService.singleton.nodes,
            () => LayoutService.singleton.graph.getGraph().camera()
        ).mesh;
    }

    getLabel(node) {
        let infos = '';
        if (node.infos) {
            infos = JSON.stringify(node.infos, null, 2);
        }
        return `${node.id}<br>\n${infos}`;
    }
}
