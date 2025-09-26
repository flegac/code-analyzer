import { Dataset } from "/dataset/dataset.model.js"


export class DatasetService {
    static singleton = new DatasetService();

    constructor() {
        this.state = new Dataset();
        console.log('initialize', this);
    }

    //----- modifications ---------------------------------------------------

    loadDataset(dataset) {
        this.state = dataset;
        return dataset;
    }

    async loadFolder(folderName, files) {
        return await loadDataset(folderName, files);
    }

    async loadDefault(projectName = 'projects/default') {
        return await loadDataset(projectName);
    }

}

async function loadDataset(projectName, fileList=null) {
    const reader = fileList === null ? new DefaultReader() : new FolderReader(projectName, fileList);
    const config = await reader.readJson(`${projectName}/config.json`)
    const labels = config?.labels?.visible || [];

    const nodes = {};
    labels.forEach(async key => {
        nodes[key] = await reader.readJson(`${projectName}/nodes/${key}.json`);
    });
    return new Dataset(
        projectName,
        await reader.readJson(`${projectName}/relation.json`),
        nodes,
        config,
    );
}

class DefaultReader {
    async readJson(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (e) {
            console.warn(`Erreur de chargement : ${path}`, e);
            return null;
        }
    }
}


class FolderReader {
    constructor(projectName, fileList) {
        this.projectName = projectName;
        this.files = Array.from(fileList);
        this.fileMap = Object.fromEntries(this.files.map(f => [f.webkitRelativePath, f]));
    }
    async load() {
        const nodes = {};
        for (const [path, file] of Object.entries(this.fileMap)) {
            const match = path.match(new RegExp(`${this.projectName}/nodes/(.+)\\.json`));
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
        console.log(`Projet "${this.projectName}" chargé depuis le disque`);
        return nodes;
    }

    async readJson(path) {
        const file = this.fileMap[path];
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

}
