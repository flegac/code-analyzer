export class DisplayUpdater {
    constructor(app) {
        this.app = app;
    }

    async apply() {
        const graph = this.app.layout.graph;
        const state = this.app.state;

        await graph.displayProvider(state).apply(graph);

        await this.applyNodes();
    }

    async applyNodes() {
        const graph = this.app.layout.graph;
        const infos = await this.app.dataset.moduleInfos();
        const nodeBaseRadius = this.app.state.nodes.baseRadius;


        //TODO : use the group strategy
        // const strategy = graph.displayProvider(this.app.state)
        // const group = strategy.apply(node.id)

        graph.data().nodes.forEach(node => {
            node.infos = infos[node.id] || {};

            let group = node.id.split('.').slice(0, this.app.state.nodes.groupHierarchyDepth).join('.');
            node.group = group;
            node.infos.group = group;
            node.radius = Math.max(nodeBaseRadius, Math.cbrt(1 + node.infos[this.app.state.nodes.size]) * nodeBaseRadius);
        });

        graph.graph
            .nodeAutoColorBy('group');

        const renderer = new DisplayNodeUpdater(this.app.state.nodes)
        renderer.apply(graph.graph);

    }


}
