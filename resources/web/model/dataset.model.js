import {GraphModel} from "/model/graph.model.js"
import {DatasetService} from "/service/dataset.service.js"

export class Dataset {
    constructor(project = 'test-project', relation, nodes, config) {
        this.project = project;
        this._relation = relation;
        this._config = config;
        this._nodes = nodes;


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
        if (this._nodes === null) return null;
        return this._nodes[name];
    }

    computeCentrality() {
        const graphModel = this.relation();
        if (!graphModel) return null;

        const graphData = typeof graphModel.data === 'function'
            ? graphModel.data()
            : graphModel.data || graphModel.graphData || graphModel;

        return computeClosenessCentrality(graphData);
    }


}


function computeClosenessCentrality(graphModel) {
    const adjacencyList = graphModel.adjacencyList;
    const nodes = Object.keys(adjacencyList);
    const totalNodes = nodes.length;
    const centrality = {};

    for (const node of nodes) {
        const distances = bfsDistances(adjacencyList, node);
        const reachable = Object.values(distances).filter(d => isFinite(d));
        const sum = reachable.reduce((a, b) => a + b, 0);

        centrality[node] = sum > 0 ? (reachable.length - 1) / sum : 0;
    }

    return centrality;
}

// 🔧 BFS pour calculer les distances minimales
function bfsDistances(adjacencyList, start) {
    const distances = {[start]: 0};
    const visited = new Set([start]);
    const queue = [start];

    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = adjacencyList[current] || [];

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                distances[neighbor] = distances[current] + 1;
                queue.push(neighbor);
            }
        }
    }

    // Ajouter les nœuds non atteignables avec distance Infinity
    for (const node of Object.keys(adjacencyList)) {
        if (!(node in distances)) {
            distances[node] = Infinity;
        }
    }

    return distances;
}
