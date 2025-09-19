import { NodeMeshModel } from "/mesh/node.mesh.model.js";

export class NodeDisplay {
    constructor() {
        this.color = node => '#fff';
        this.radius = node => 10.;
    }

    async apply(graph, state) {
        graph.graph
            .nodeAutoColorBy('group')
            .nodeThreeObject(node => new NodeMeshModel(node, state).mesh)
            .nodeLabel(node => {
                let infos = '';
                if (node.infos) {
                    infos = JSON.stringify(node.infos, null, 2);
                }
                return `${node.id}<br>\n${infos}`;
            });
    }
}
