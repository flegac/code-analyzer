import { ClusterStrategy } from "./cluster.strategy.js";
import { G, MyNode } from "../visuals/graph.service.js";
import { ForceGraph } from "../project/graph.model.js";




export class WardClusterStrategy extends ClusterStrategy {
    clusterNumber: number;
    groupById: { [key: string]: any };
    constructor(graph: ForceGraph, clusterNumber = 5, k = 10) {
        super();
        this.clusterNumber = clusterNumber;

        // const partition = new WardClustering(graph.adjacencyList, clusterNumber, k).run();
        const partition = new WardClustering2(G.state.nodes, clusterNumber, k).run();

        this.groupById = {};
        partition.forEach((group: string[], groupId: string) => {
            group.forEach((nodeId: string) => {
                this.groupById[nodeId] = groupId;
            });
        });
    }

    apply(node: MyNode) {
        return this.groupById[node.id];
    }
}

export class WardClustering2 {
    nodes: MyNode[];
    targetClusterCount: number;
    k: number;
    graph: { [k: string]: string[] };
    clusters: Set<string>[];
    costCache: Map<any, any>;
    constructor(nodes: MyNode[], targetClusterCount = 5, k = 10) {
        this.nodes = nodes; // [{ id, x, y, z }]
        this.targetClusterCount = targetClusterCount;
        this.k = k;

        this.graph = this._buildKNNGraph(); // graphe kNN basé sur distance
        this.clusters = this._initializeClusters();
        this.costCache = new Map();
    }

    run(): string[][] {
        while (this.clusters.length > this.targetClusterCount) {
            const [i, j] = this._findBestMerge();
            if (i === -1 || j === -1) break;
            this._mergeClusters(i, j);
            this._invalidateCostCache(i, j);
        }
        return this.clusters.map((set: Set<string>) => Array.from(set));
    }

    // 🔧 Étape 1 : construire le graphe kNN basé sur distance euclidienne
    _buildKNNGraph() {
        const graph: { [k: string]: any } = {};
        const distance = (a: MyNode, b: MyNode) => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dz = a.z - b.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };

        for (const node of this.nodes) {
            const others = this.nodes.filter(n => n.id !== node.id);
            const sorted = others.sort((a, b) => distance(node, a) - distance(node, b));
            graph[node.id] = sorted.slice(0, this.k).map(n => n.id);
        }

        return graph;
    }

    _initializeClusters(): Set<string>[] {
        return this.nodes.map(node => new Set([node.id]));
    }

    _computeInterClusterEdges(c1: Set<string>, c2: Set<string>) {
        let edges = 0;
        for (const n1 of c1) {
            for (const n2 of this.graph[n1] || []) {
                if (c2.has(n2)) edges++;
            }
        }
        for (const n2 of c2) {
            for (const n1 of this.graph[n2] || []) {
                if (c1.has(n1)) edges++;
            }
        }
        return edges;
    }

    _computeMergeCost(i: number, j: number) {
        const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (this.costCache.has(key)) return this.costCache.get(key);

        const c1 = this.clusters[i];
        const c2 = this.clusters[j];
        const totalSize = c1.size + c2.size;
        const edgeCount = this._computeInterClusterEdges(c1, c2);

        const possibleLinks = totalSize * (totalSize - 1);
        const density = edgeCount / possibleLinks;
        const cost = 1 - density;

        this.costCache.set(key, cost);
        return cost;
    }

    _findBestMerge() {
        let minCost = Infinity;
        let mergePair = [-1, -1];

        for (let i = 0; i < this.clusters.length; i++) {
            for (let j = i + 1; j < this.clusters.length; j++) {
                const cost = this._computeMergeCost(i, j);
                if (cost < minCost) {
                    minCost = cost;
                    mergePair = [i, j];
                }
            }
        }

        return mergePair;
    }

    _mergeClusters(i: number, j: number) {
        const merged = new Set([...this.clusters[i], ...this.clusters[j]]);
        this.clusters.splice(j, 1);
        this.clusters.splice(i, 1);
        this.clusters.push(merged);
    }

    _invalidateCostCache(i: number, j: number) {
        const n = this.clusters.length;
        for (let x = 0; x < n; x++) {
            const keys = [
                `${Math.min(i, x)}-${Math.max(i, x)}`,
                `${Math.min(j, x)}-${Math.max(j, x)}`
            ];
            keys.forEach(key => this.costCache.delete(key));
        }
    }
}


export class WardClustering {
    originalGraph: { [k: string]: string[] };
    targetClusterCount: number;
    k: number;
    graph: { [k: string]: string[] };
    clusters: Set<string>[];
    costCache: Map<any, any>;
    constructor(graph: { [k: string]: string[] }, targetClusterCount = 5, k = 10) {
        this.originalGraph = graph; // graphe orienté { nodeId: [neighbors] }
        this.targetClusterCount = targetClusterCount;
        this.k = k;

        this.graph = this._buildKNNGraph(); // graphe réduit
        this.clusters = this._initializeClusters();
        this.costCache = new Map();
    }

    run() {
        while (this.clusters.length > this.targetClusterCount) {
            const [i, j] = this._findBestMerge();
            if (i === -1 || j === -1) break;
            this._mergeClusters(i, j);
            this._invalidateCostCache(i, j);
        }
        return this.clusters.map(set => Array.from(set));
    }

    // 🔧 Étape 1 : construire le graphe kNN
    _buildKNNGraph() {
        const frequency: { [k: string]: number } = {};
        for (const node in this.originalGraph) {
            for (const neighbor of this.originalGraph[node]) {
                frequency[neighbor] = (frequency[neighbor] || 0) + 1;
            }
        }

        const knn: { [k: string]: string[] } = {};
        for (const node in this.originalGraph) {
            const neighbors = this.originalGraph[node] || [];
            const sorted = neighbors.sort((a, b) => (frequency[b] || 0) - (frequency[a] || 0));
            knn[node] = sorted.slice(0, this.k);
        }

        return knn;
    }

    // 🔧 Étape 2 : initialiser chaque nœud comme cluster
    _initializeClusters() {
        return Object.keys(this.graph).map(node => new Set([node]));
    }

    // 🔧 Étape 3 : calculer les arêtes entre deux clusters
    _computeInterClusterEdges(c1: Set<string>, c2: Set<string>) {
        let edges = 0;
        for (const n1 of c1) {
            for (const n2 of this.graph[n1] || []) {
                if (c2.has(n2)) edges++;
            }
        }
        for (const n2 of c2) {
            for (const n1 of this.graph[n2] || []) {
                if (c1.has(n1)) edges++;
            }
        }
        return edges;
    }

    // 🔧 Étape 4 : coût de fusion basé sur densité
    _computeMergeCost(i: number, j: number) {
        const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (this.costCache.has(key)) return this.costCache.get(key);

        const c1 = this.clusters[i];
        const c2 = this.clusters[j];
        const totalSize = c1.size + c2.size;
        const edgeCount = this._computeInterClusterEdges(c1, c2);

        const possibleLinks = totalSize * (totalSize - 1);
        const density = edgeCount / possibleLinks;
        const cost = 1 - density;

        this.costCache.set(key, cost);
        return cost;
    }

    // 🔧 Étape 5 : trouver la meilleure paire à fusionner
    _findBestMerge() {
        let minCost = Infinity;
        let mergePair = [-1, -1];

        for (let i = 0; i < this.clusters.length; i++) {
            for (let j = i + 1; j < this.clusters.length; j++) {
                const cost = this._computeMergeCost(i, j);
                if (cost < minCost) {
                    minCost = cost;
                    mergePair = [i, j];
                }
            }
        }

        return mergePair;
    }

    // 🔧 Étape 6 : fusionner deux clusters
    _mergeClusters(i: number, j: number) {
        const merged = new Set([...this.clusters[i], ...this.clusters[j]]);
        this.clusters.splice(j, 1);
        this.clusters.splice(i, 1);
        this.clusters.push(merged);
    }

    // 🔧 Étape 7 : invalider les coûts liés aux clusters fusionnés
    _invalidateCostCache(i: number, j: number) {
        const n = this.clusters.length;
        for (let x = 0; x < n; x++) {
            const keys = [
                `${Math.min(i, x)}-${Math.max(i, x)}`,
                `${Math.min(j, x)}-${Math.max(j, x)}`
            ];
            keys.forEach(key => this.costCache.delete(key));
        }
    }
}
