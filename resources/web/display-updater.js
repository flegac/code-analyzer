export class DisplayUpdater {
    constructor(app) {
        this.app = app;
    }

    async apply() {
        const graph = this.app.layout.graph;
        const state = this.app.state.display;
        const displayProvider = graph.displayProvider(state);
        await displayProvider.apply(graph, state);
    }
}
