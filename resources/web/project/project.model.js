import { GraphModel } from "./graph.model.js"
import { FF } from "../display/filter/filter.service.js"


export class Project {
    constructor(project = 'test-project', relation, nodes = {}, config = {}) {
        this.project = project;
        this._relation = relation;
        this._nodes = nodes;
        this._config = config;
        console.log('new Project()', this);
    }

    labels() {
        return this._config?.labels?.visible ?? [];
    }

    numerics() {
        return this._config?.labels?.numeric ?? [];
    }

    categories() {
        return this._config?.labels?.category ?? [];
    }

    config() {
        return this._config;
    }

    relation() {
        if (this._relation === null) {
            return null;
        }

        const pipeline = FF.pipeline();

        const graph = pipeline.reduce((acc, mapper) => mapper(acc), this._relation);
        return new GraphModel('relation', graph);
    }

    hierarchy() {
        const graph = this.relation();
        if (graph === null) return null;
        return GraphModel.hierarchy(graph);
    }

    read(label, id) {
        return this._nodes?.[label]?.[id] ?? null;
    }

}
