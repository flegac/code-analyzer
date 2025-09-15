class GraphUpdaterNode {
    constructor(updater) {
        this.updater = updater;
    }

    async apply(graph) {
        const infos = await this.updater.children.dataset.moduleInfos();


        graph.data().nodes.forEach(node => {
            node.infos = infos[node.id] || {};
            let group = node.id.split('.').slice(0, this.updater.params.nodes.groupHierarchyDepth).join('.');
            node.group = group;
            node.infos.group = group;
        });
        graph.graph
            .nodeVal(node => node.infos[this.updater.params.nodes.size])
            .nodeAutoColorBy('group')
            .nodeRelSize(4)
        ;

        // TODO: better handling of that
        // TODO: automatic resize ?
        const renderer = new GraphNodeRenderer(this.updater.params.nodes)
        renderer.apply(graph.graph);
    }
}
