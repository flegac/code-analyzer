export class LinkDisplay {
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
