import {NodeMeshModel} from "/mesh/node.mesh.model.js";
import {GraphService} from "/service/graph.service.js";
import {DisplayService} from "/service/display.service.js";


class NodeDisplay {
    constructor() {
        this.color = node => '#fff';
        this.radius = node => 10.;
    }

    async apply(graph) {
        const nodeParams = DisplayService.singleton.nodes;

        const G = GraphService.singleton;
        G.updateGroup();

        //required for nodeAutoColorBy()
        G.nodes.forEach(node => node.color = null);
        graph.graph
            .nodeAutoColorBy('group')
            .nodeThreeObject(node => new NodeMeshModel(
                node,
                nodeParams,
                () => graph.graph.camera()
            ).mesh)
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

    async apply(graph) {
        await this.node.apply(graph);
        await this.link.apply(graph);
    }
}

export {LinkDisplay, NodeDisplay, GraphDisplay};
