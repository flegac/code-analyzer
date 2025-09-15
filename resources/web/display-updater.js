class DisplayUpdater {
    constructor(updater) {
        this.updater = updater;
    }

    async apply() {
        await this.applyLinks();
        await this.applyNodes();
    }

    async applyLinks() {
        const graph = this.updater.graph;
        const params = this.updater.params.links;

        graph.graph
            // .linkCurvature(.3)
            // .linkAutoColorBy('label')
            .linkDirectionalParticles(link => {
                 if (link.label !== 'hierarchy' && link.source.group === link.target.group) {
                    return 0;
                }
                return params[link.label]?.particles ?? 0;
            })
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
    }

    async applyNodes() {
        const graph = this.updater.graph;
        const infos = await this.updater.children.dataset.moduleInfos();
        const nodeBaseRadius = 12;


        graph.data().nodes.forEach(node => {
            node.infos = infos[node.id] || {};
            let group = node.id.split('.').slice(0, this.updater.params.nodes.groupHierarchyDepth).join('.');
            node.group = group;
            node.infos.group = group;
            node.radius = Math.max(nodeBaseRadius, Math.cbrt(1 + node.infos[this.updater.params.nodes.size]) * nodeBaseRadius);
        });
        graph.graph
            .nodeAutoColorBy('group')
        ;

        // TODO: better handling of that
        // TODO: automatic resize ?
        const renderer = new DisplayNodeUpdater(this.updater.params.nodes)
        renderer.apply(graph.graph);
    }
}
