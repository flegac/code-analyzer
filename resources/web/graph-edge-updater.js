class GraphEdgeUpdater {
    constructor() {
        this.params = {
            dependencies: {
                color: '#0f0',
                distance: 10,
                strength: 1.,
                width: 1,
            },
            hierarchy: {
                color: '#ffff00',
                distance: 10,
                strength: 100.,
                width: 10,
            },
        }
    }

    async apply(graph) {
        graph.graph.d3Force('link').distance(link => {
            return 10 * this.params[link.label]?.distance ?? 10;
        });
        graph.graph.d3Force('link').strength(link => {
            return .01 * this.params[link.label]?.strength ?? .1;
        });

        graph.graph
            // .linkCurvature(.3)
            // .linkAutoColorBy('label')
            .linkWidth((link) => {
                return this.params[link.label]?.width ?? 1;
            })
            .linkColor((link) => {
                return this.params[link.label]?.color ?? '#f00';
            })
        ;
        graph.graph.d3ReheatSimulation();
    }
}