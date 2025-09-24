import { GraphModel } from "/graph/graph.model.js"
import { DatasetService } from "/dataset/dataset.service.js"

export class Dataset {
    constructor(project = 'test-project', relation, nodes = {}, config = {}) {
        this.project = project;
        this._relation = relation;
        this._nodes = nodes;
        this._config = config;

        const labels = new Set();
        Object.values(nodes).forEach(dat => {
            Object.values(dat).forEach(values => {
                for (const key of Object.keys(values)) {
                    labels.add(key);
                }
            });
        })

        this.labels = [...labels];

        console.log('new Dataset()', relation, nodes, config)
    }

    config() {
        return this._config;
    }

    relation() {
        if (this._relation === null) {
            return null;
        }

        const pipeline = DatasetService.singleton.pipeline();

        const graph = pipeline.reduce((acc, mapper) => mapper(acc), this._relation);
        return new GraphModel('relation', graph);
    }

    hierarchy() {
        const graph = this.relation();
        if (graph === null) return null;
        return GraphModel.hierarchy(graph);
    }

    nodes(name = 'stats') {
        if (!this._nodes) return null;
        return this._nodes[name];
    }

}
