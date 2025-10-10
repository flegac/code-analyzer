import { NodeMetrics } from "./node.metrics.js";


export class ClosenessCentrality extends NodeMetrics {
    constructor(graphModel) {
        super('centrality');
        
        const graph = graphModel.adjacencyList;
        const nodes = Object.keys(graph);
        const visits = {};
        for (const node of nodes) {
            const distances = _bfsDistances(graph, node);
            const reachable = Object.values(distances).filter(d => isFinite(d));
            const sum = reachable.reduce((a, b) => a + b, 0);
            visits[node] = sum > 0 ? (reachable.length - 1) / sum : 0;
        }
        this.visits = visits;
    }

    getValue(node) {
        return this.visits?.[node.id];
    }
}


// 🔧 BFS pour calculer les distances
function _bfsDistances(graph, start) {
    const distances = { [start]: 0 };
    const visited = new Set([start]);
    const queue = [start];

    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = graph[current] || [];

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                distances[neighbor] = distances[current] + 1;
                queue.push(neighbor);
            }
        }
    }

    // Ajouter les nœuds non atteignables avec distance Infinity
    for (const node of Object.keys(graph)) {
        if (!(node in distances)) {
            distances[node] = Infinity;
        }
    }

    return distances;
}
