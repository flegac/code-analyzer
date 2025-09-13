class GraphEdgeUpdater {
    constructor(controls) {
        this.controls = controls;
    }

    async apply(graph) {

        graph.graph
            // .linkCurvature(.3)
            // .linkAutoColorBy('label')
            .linkWidth((link) => {
                if (link.label === 'hierarchy') {
                    return 3;
                }
                return 1;
            })
            .linkColor((link) => {
                if (link.label === 'hierarchy') {
                    return '#0f0'
                    // return '#0000'
                }
                if (link.label === 'dependencies') {
                    // return '#0000'
                    const src = graph.nodesMap[link.source];
                    const dst = graph.nodesMap[link.target];
                    if (src && dst) {
                        if (src.group === dst.group) {
                            return '#ccc';
                        }
                        return dst.color;
                    }

                    return '#c800ff'
                }
                return '#f00';
            })
        ;
    }
}