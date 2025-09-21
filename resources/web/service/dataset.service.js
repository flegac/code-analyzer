import {GraphService} from "/service/graph.service.js"
import {Dataset} from "/model/dataset.model.js"
import {GraphFilter} from "/model/graph.filter.model.js"
import {LayoutService} from "/service/layout.service.js"

export class DatasetService {
    static singleton = new DatasetService();

    constructor() {
        this.state = new Dataset();
        this.depthCollapseLimit = 5;
        console.log('initialize', this);
    }

    //----- modifications ---------------------------------------------------

    pipeline() {
        return [
            graph => new GraphFilter(this.state.config()).apply(graph),
            GraphService.singleton.nodeReducer((node) => {
                return node.split('.').slice(0, this.depthCollapseLimit).join('.');
            })
        ];
    }

    async loadWorkspace(files) {
        //TODO: load all projects / datasets in a directory (ask right only once)
    }

    async changeDataset(dataset) {
        this.state = dataset;
        await GraphService.singleton.rebuildGraph();
        LayoutService.singleton.table.rebuild(dataset.nodes());
    }

    async load(folderName, files) {
        return await loadDataset(folderName, files);
    }

    async loadDefault() {
        return await loadDefault()
    }

}

async function loadDefault() {
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


    return new Dataset(
        'default',
        await readJson(`${defaultProject}/relation.json`),
        {
            'stats': await readJson(`${defaultProject}/nodes/stats.json`)
        },
        await readJson(`${defaultProject}/config.json`),
    );

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
