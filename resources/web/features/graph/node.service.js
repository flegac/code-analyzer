import { ClusterStrategy } from "/graph/cluster.strategy.model.js";

export class NodeService {
    static singleton = new NodeService();

    hierarchicDepthTagger(depth) {
        const strategy = new ClusterStrategy(depth);
        return (node) => strategy.apply(node.id);
    }

    computeClosenessCentrality(graphModel) {
        const graph = graphModel.adjacencyList;
        const nodes = Object.keys(graph);
        const result = {};

        for (const node of nodes) {
            const distances = _bfsDistances(graph, node);
            const reachable = Object.values(distances).filter(d => isFinite(d));
            const sum = reachable.reduce((a, b) => a + b, 0);

            result[node] = sum > 0 ? (reachable.length - 1) / sum : 0;
        }

        return result;
    }

}

// 🔧 BFS pour calculer les distances minimales
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
