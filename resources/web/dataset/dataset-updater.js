import {GraphFilter} from "/graph/graph-filter.js"
import {MyGraph} from "/graph/my-graph.js"
import {nodeReducer} from "/graph/graph-algo.js"

export class DatasetUpdater {
    constructor(app) {
        this.app = app
    }

    async apply() {
        const dependencies = await this.dependencies()
        this.app.layout.tree.rebuild(MyGraph.hierarchy(dependencies));
    }

    async loadConfig() {
        return await fetch(this.app.state.dataset.configPath).then(res => res.json());
    }

    async dependencies() {
        if (this.app.state.dataset.dataset === null) {
            this.app.state.dataset.dataset = await fetch(this.app.state.dataset.datasetPath).then(res => res.json());
            console.log(`loading from ${this.app.state.dataset.datasetPath}`);
        }
        let raw = this.app.state.dataset.dataset;
        const config = await this.loadConfig();

        const pipeline = [
            graph => new GraphFilter(config).apply(graph),
            nodeReducer((node) => {
                return node.split('.').slice(0, this.app.state.dataset.depthCollapseLimit).join('.');
            })
        ];
        const graph = pipeline.reduce((acc, mapper) => mapper(acc), raw);

        return new MyGraph('dependencies', graph);
    }

    async moduleInfos() {
        const path = this.app.state.dataset.moduleInfosPath
        try {
            return await fetch(path).then(res => res.json());
        } catch (e) {
            console.warn(`error loading ${path}: ${e}`)
            return null;
        }
    }
}
