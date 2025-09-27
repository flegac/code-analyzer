import { NodeMetrics } from "./node.metrics.js";

export class CycleCounter extends NodeMetrics {
    constructor(graphModel) {
        super('cycles');

        const graph = graphModel.adjacencyList;
        this.graph = graph;
        this.nodes = Object.keys(graph);
        this.cycles = [];
        this.blocked = new Set();
        this.blockMap = new Map();
        this.stack = [];

        // Calcul des cycles
        this._computeCycles();

        // Comptage des participations
        this.cycleCount = Object.fromEntries(this.nodes.map(n => [n, 0]));
        for (const cycle of this.cycles) {
            for (const node of cycle) {
                this.cycleCount[node]++;
            }
        }
    }

    getValue(node) {
        return this.cycleCount?.[node.id] || 0;
    }

    _computeCycles() {
        for (let i = 0; i < this.nodes.length; i++) {
            const start = this.nodes[i];
            const subgraph = this._buildSubgraph(start);
            this._circuit(start, start, subgraph);
            this._resetState();
        }
    }

    _circuit(v, start, graph) {
        this.stack.push(v);
        this.blocked.add(v);

        for (const w of graph[v] || []) {
            if (w === start) {
                this.cycles.push([...this.stack]);
            } else if (!this.blocked.has(w)) {
                this._circuit(w, start, graph);
            }
        }

        this.stack.pop();
        this._unblock(v);
    }

    _unblock(node) {
        this.blocked.delete(node);
        const blockedNodes = this.blockMap.get(node) || [];
        for (const n of blockedNodes) {
            if (this.blocked.has(n)) {
                this._unblock(n);
            }
        }
        this.blockMap.set(node, []);
    }

    _resetState() {
        this.blocked.clear();
        this.blockMap.clear();
        this.stack = [];
    }

    _buildSubgraph(start) {
        const subgraph = {};
        const index = this.nodes.indexOf(start);
        const subNodes = this.nodes.slice(index);

        for (const node of subNodes) {
            subgraph[node] = (this.graph[node] || []).filter(n => subNodes.includes(n));
        }

        return subgraph;
    }
}
