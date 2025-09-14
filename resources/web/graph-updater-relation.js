class GraphUpdaterRelation {
    constructor(updater) {
        this.updater = updater;
    }

    async apply(graph) {
        const params = this.updater.params.relations;

        let links = graph.graph.d3Force('link');
        links.distance(link => {
            return 10 * params[link.label]?.distance ?? 10;
        });
        links.strength(link => {
            return .01 * params[link.label]?.strength ?? .1;
        });

        graph.graph
            // .linkCurvature(.3)
            // .linkAutoColorBy('label')
            .linkWidth((link) => {
                return params[link.label]?.width ?? 1;
            })
            .linkColor((link) => {
                return params[link.label]?.color ?? '#f00';
            })
        ;
        graph.graph.d3ReheatSimulation();
    }
}