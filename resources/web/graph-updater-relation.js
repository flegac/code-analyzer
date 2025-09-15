class GraphUpdaterRelation {
    constructor(updater) {
        this.updater = updater;
    }

    async apply() {
        const graph = this.updater.graph;
        const params = this.updater.params.relations;


        if (this.updater.params.physics.isActive) {
            let links = graph.graph.d3Force('link');
            links.distance(link => {
                return 10 * params[link.label]?.distance ?? 10;
            });
            links.strength(link => {
                return .01 * params[link.label]?.strength ?? .1;
            });
        }


        graph.graph
            // .linkCurvature(.3)
            // .linkAutoColorBy('label')

            // .linkDirectionalParticles(2)
            .linkDirectionalParticleWidth(link => {
                return 2 + params[link.label]?.width * .5;
            })
            .linkDirectionalParticleSpeed(0.01)
            .linkWidth((link) => {
                return params[link.label]?.width ?? 1;
            })
            .linkColor((link) => {
                if (link.label !== 'hierarchy' && link.source.group === link.target.group) {
                    return '#ccc'
                }

                return params[link.label]?.color ?? '#f00';
            })
        ;
        graph.graph.d3ReheatSimulation();
    }
}
