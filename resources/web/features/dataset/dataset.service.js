import { Dataset } from "/dataset/dataset.model.js"
import { GraphFilter } from "/graph/graph.filter.model.js"

export class DatasetService {
    static singleton = new DatasetService();

    constructor() {
        this.state = new Dataset();
        this.hierarchyPruneLevel = 4;
        console.log('initialize', this);
    }

    //----- modifications ---------------------------------------------------

    pipeline() {
        return [
            graph => new GraphFilter(this.state.config()).apply(graph),
            this.nodeReducer((node) => {
                return node.split('.').slice(0, this.hierarchyPruneLevel).join('.');
            })
        ];
    }

    loadDataset(dataset) {
        this.state = dataset;
        return dataset;
    }

    async loadFolder(folderName, files) {
        return await loadDataset(folderName, files);
    }

    async loadDefault() {
        const defaultProject = 'projects/default';

        const readJson = async (path) => {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (e) {
                console.warn(`Erreur de chargement : ${path}`, e);
                return null;
            }
        };


        const dataset = new Dataset(
            'default',
            await readJson(`${defaultProject}/relation.json`),
            {
                'stats': await readJson(`${defaultProject}/nodes/stats.json`)
            },
            await readJson(`${defaultProject}/config.json`),
        );
        return this.loadDataset(dataset);
    }


    nodeReducer(mapping) {
        return (graph) => {

            if (graph === null) {
                return null;
            }

            const nodes = new Set();
            const reducedAdjacency = new Map();

            for (const [src, targets] of Object.entries(graph)) {
                const mappedSrc = mapping(src);
                nodes.add(mappedSrc);

                for (const tgt of targets) {
                    const mappedTgt = mapping(tgt);
                    nodes.add(mappedTgt);

                    if (mappedSrc === mappedTgt) continue;
                    if (!reducedAdjacency.has(mappedSrc)) {
                        reducedAdjacency.set(mappedSrc, new Set());
                    }
                    reducedAdjacency.get(mappedSrc).add(mappedTgt);
                }
            }
            const result = {};
            for (const node of nodes) {
                result[node] = [];
            }
            for (const [node, neighbors] of reducedAdjacency.entries()) {
                result[node] = Array.from(neighbors);
            }
            return result;
        }
    }

}

async function loadDataset(projectName, fileList) {
    const files = Array.from(fileList);
    console.log(`loading files for project ${projectName}`, files);

    const fileMap = Object.fromEntries(files.map(f => [f.webkitRelativePath, f]));

    // 🔹 Charger tous les fichiers nodes/*.json
    const nodes = {};
    for (const [path, file] of Object.entries(fileMap)) {
        const match = path.match(new RegExp(`${projectName}/nodes/(.+)\\.json`));
        if (match) {
            const name = match[1];
            try {
                const text = await file.text();
                nodes[name] = JSON.parse(text);
            } catch (e) {
                console.warn(`Erreur de lecture moduleInfos : ${path}`, e);
            }
        }
    }

    console.log(`Projet "${projectName}" chargé depuis le disque`);
    return new Dataset(
        projectName,
        await readJson(`${projectName}/relation.json`, fileMap),
        nodes,
        await readJson(`${projectName}/config.json`, fileMap)
    );
}

async function readJson(path, fileMap) {
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
}
