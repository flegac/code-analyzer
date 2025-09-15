class GraphUpdaterNode {
    constructor(updater) {
        this.updater = updater;
    }

    async apply() {
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
        const renderer = new GraphNodeRenderer(this.updater.params.nodes)
        renderer.apply(graph.graph);
    }
}
