class LinkDisplay {
    constructor() {
        this.color = '#fff';
        this.width = 1.;
        this.curvature = 0.;
        this.particleNumber = 0;
        this.particleSpeed = .01;
        this.particleWidth = null;
    }

    async apply(graph) {
        graph.graph
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
}

class GraphDisplay {
    constructor() {
        this.node = new NodeDisplay();
        this.link = new LinkDisplay();
    }
}

export {LinkDisplay, NodeDisplay, GraphDisplay};
