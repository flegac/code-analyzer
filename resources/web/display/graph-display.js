import {NodeMesh} from "/mesh/node-mesh.js"


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
            .linkColor(this.color)
    }
}

class NodeDisplay {
    constructor() {
        this.color = node => '#fff';
        this.radius = node => 10.;
    }

    async apply(graph, state) {
        graph.graph
            .nodeAutoColorBy('group')
            .nodeThreeObject(node => new NodeMesh(node, state.nodes).mesh)
            .nodeLabel(node => {
                let infos = '';
                if (node.infos) {
                    infos = JSON.stringify(node.infos, null, 2);
                }
                return `${node.id}<br>\n${infos}`;
            })
        ;
    }
}

class GraphDisplay {
    constructor() {
        this.node = new NodeDisplay();
        this.link = new LinkDisplay();
    }

    async apply(graph, state) {
        await this.link.apply(graph);
        await this.node.apply(graph, state);
    }
}

export {LinkDisplay, NodeDisplay, GraphDisplay};
