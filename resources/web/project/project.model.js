import { GraphModel } from "./graph.model.js"
import { FF } from "../display/filter.service.js"


export class Project {
    constructor(project = 'test-project', relation, nodes = {}, config = {}) {
        this.project = project;
        this._relation = relation;
        this._nodes = nodes;
        this.numerics = Object.entries(this._nodes)
            .filter(([key]) => key.split('.')[1] === 'number')
            .map(([key]) => key.split('.')[0]);
        this.categories = Object.entries(this._nodes)
            .filter(([key]) => key.split('.')[1] === 'text')
            .map(([key]) => key.split('.')[0]);
        this.labels = [... this.categories, ...this.numerics]
        this.filters = {
            selected: config.filter.selected,
            excluded: config.filter.excluded,
            groups: config.filter.groups
        };
        this._config = config;
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
        const key = label in this.numerics ? `${label}.number` : `${label}.text`;
        return this._nodes?.[key]?.[id] ?? null;
    }

}
