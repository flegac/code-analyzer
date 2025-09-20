import {NodeMeshModel} from "/mesh/node.mesh.model.js";
import {GraphService} from "/service/graph.service.js";
import {LayoutService} from "/service/layout.service.js";


class NodeDisplay {
    constructor() {
        this.color = node => '#fff';
        this.radius = node => 10.;
    }

    async apply(graph, state) {
        const G = GraphService.singleton;
        G.updateGroup();
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

class LinkDisplay {
    constructor() {
        this.visibility = true;
        this.color = '#fff';
        this.width = 1.;
        this.curvature = 0.;
        this.particleNumber = 0;
        this.particleSpeed = .01;
        this.particleWidth = null;
    }

    async apply(graph) {
        graph.graph
            .linkVisibility(this.visibility)
            .linkCurvature(this.curvature)
            .linkDirectionalParticles(this.particleNumber)
            .linkDirectionalParticleWidth(this.particleWidth)
            .linkDirectionalParticleSpeed(this.particleSpeed)
            .linkWidth(this.width)
            .linkColor(this.color);
    }
}

class GraphDisplay {
    constructor() {
        this.node = new NodeDisplay();
        this.link = new LinkDisplay();
    }

    async apply(graph, state) {
        await this.node.apply(graph, state);
        await this.link.apply(graph);
    }
}

export {LinkDisplay, NodeDisplay, GraphDisplay};
