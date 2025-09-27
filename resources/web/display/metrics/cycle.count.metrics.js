import { NodeMetrics } from "./node.metrics.js";

export class CycleCounter extends NodeMetrics {
    constructor(graphModel) {
        super('cycles');

        const graph = graphModel.adjacencyList;
        this.graph = graph;
        this.nodes = Object.keys(graph);
        this.cycles = [];
        this.cycleCount = Object.fromEntries(this.nodes.map(n => [n, 0]));
        this.seenCycles = new Set();

        this._computeCycles();
    }

    getValue(node) {
        return this.cycleCount?.[node.id] || 0;
    }

    _computeCycles() {
        const sccs = _tarjanSCC(this.graph);
        for (const scc of sccs) {
            const subgraph = {};
            for (const node of scc) {
                subgraph[node] = this.graph[node].filter(n => scc.includes(n));
            }
            for (const start of scc) {
                this._circuit(start, start, subgraph, [], new Set(), 0, 10);
            }
        }
    }

    _circuit(v, start, graph, path, visited, depth, maxDepth) {
        if (depth > maxDepth) return;

        path.push(v);
        visited.add(v);

        for (const w of graph[v] || []) {
            if (w === start && path.length > 1) {
                const key = _canonicalCycle(path);
                if (!this.seenCycles.has(key)) {
                    this.seenCycles.add(key);
                    this.cycles.push([...path]);
                    for (const node of path) {
                        this.cycleCount[node]++;
                    }
                }
            } else if (!visited.has(w)) {
                this._circuit(w, start, graph, path, visited, depth + 1, maxDepth);
            }
        }

        path.pop();
        visited.delete(v);
    }
}
function _canonicalCycle(path) {
    const minIndex = path.reduce((minIdx, val, idx) =>
        val < path[minIdx] ? idx : minIdx, 0);
    const rotated = path.slice(minIndex).concat(path.slice(0, minIndex));
    return rotated.join(',');
}

function _tarjanSCC(graph) {
    let index = 0;
    const indices = {};
    const lowlink = {};
    const stack = [];
    const onStack = new Set();
    const result = [];

    function strongConnect(v) {
        indices[v] = index;
        lowlink[v] = index;
        index++;
        stack.push(v);
        onStack.add(v);

        for (const w of graph[v] || []) {
            if (!(w in indices)) {
                strongConnect(w);
                lowlink[v] = Math.min(lowlink[v], lowlink[w]);
            } else if (onStack.has(w)) {
                lowlink[v] = Math.min(lowlink[v], indices[w]);
            }
        }

        if (lowlink[v] === indices[v]) {
            const scc = [];
            let w;
            do {
                w = stack.pop();
                onStack.delete(w);
                scc.push(w);
            } while (w !== v);
            if (scc.length > 1) result.push(scc);
        }
    }

    for (const v of Object.keys(graph)) {
        if (!(v in indices)) strongConnect(v);
    }

    return result;
}
