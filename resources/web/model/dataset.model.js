import {GraphModel} from "/model/graph.model.js"
import {DatasetService} from "/service/dataset.service.js"

export class Dataset {
    constructor(project = 'test-project') {
        this.project = project;

        this._config = null;
        this._moduleInfos = null;
        this._relation = null;
    }

    static async load(projectName, fileList) {
        const files = Array.from(fileList);
        console.log(`loading files for project ${projectName}`, files);

        const fileMap = Object.fromEntries(files.map(f => [f.webkitRelativePath, f]));
        const dataset = new Dataset(projectName);

        const readJson = async (path) => {
            const file = fileMap[path];
            if (!file) {
                console.warn(`Fichier manquant : ${path}`);
                return null;
            }
            try {
                const text = await file.text();
                return JSON.parse(text);
            } catch (e) {
                console.error(`Erreur de lecture JSON : ${path}`, e);
                return null;
            }
        };

        // 🔹 Charger config.json
        dataset._config = await readJson(`${projectName}/config.json`);

        // 🔹 Charger relation.json
        dataset._relation = await readJson(`${projectName}/relation.json`);

        // 🔹 Charger tous les fichiers nodes/*.json
        dataset._moduleInfos = {};
        for (const [path, file] of Object.entries(fileMap)) {
            const match = path.match(new RegExp(`${projectName}/nodes/(.+)\\.json`));
            if (match) {
                const name = match[1];
                try {
                    const text = await file.text();
                    dataset._moduleInfos[name] = JSON.parse(text);
                } catch (e) {
                    console.warn(`Erreur de lecture moduleInfos : ${path}`, e);
                }
            }
        }

        console.log(`Projet "${projectName}" chargé depuis le disque: ${dataset._relation}`);

        return dataset;
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

    moduleInfos(name = 'stats') {
        if (this._moduleInfos === null) return null;
        return this._moduleInfos[name];
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
