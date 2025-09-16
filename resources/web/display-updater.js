import {GraphDisplay} from "graph-display";

export class DisplayUpdater {
    constructor(app) {
        this.app = app;
    }

    async apply() {
        const graph = this.app.layout.graph;
        const state = this.app.state;

        const display = new GraphDisplay()
        Object.assign(display.link, {
            color: link => {
                if (link.label !== 'hierarchy' && link.source.group === link.target.group) {
                    return '#ccc'
                }
                return state.links[link.label]?.color ?? '#f00';
            },
            width: link => {
                return state.links[link.label]?.width
            },
            particleNumber: link => {
                if (link.label !== 'hierarchy' && link.source.group === link.target.group) {
                    return 0;
                }
                return state.links[link.label]?.particles ?? 0;
            },
            particleWidth: link => {
                return 2 + state.links[link.label]?.width * .5;
            },
        });
        await display.link.apply(graph);

        await this.applyNodes();
    }

    async applyNodes() {
        const graph = this.app.layout.graph;
        const infos = await this.app.dataset.moduleInfos();
        const nodeBaseRadius = this.app.state.nodes.baseRadius;

        graph.data().nodes.forEach(node => {
            node.infos = infos[node.id] || {};
            let group = node.id.split('.').slice(0, this.app.state.nodes.groupHierarchyDepth + 1).join('.');
            node.group = group;
            node.infos.group = group;
            node.radius = Math.max(nodeBaseRadius, Math.cbrt(1 + node.infos[this.app.state.nodes.size]) * nodeBaseRadius);
        });
        graph.graph
            .nodeAutoColorBy('group')
        ;

        const renderer = new DisplayNodeUpdater(this.app.state.nodes)
        renderer.apply(graph.graph);
    }


}
