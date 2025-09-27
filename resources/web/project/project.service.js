import { Project } from "./project.model.js"


export class ProjectService {
    static singleton = new ProjectService();

    constructor() {
        this.project = new Project();
        console.log('initialize', this);
    }

    //----- modifications ---------------------------------------------------

    loadProject(project) {
        this.project = project;
        return project;
    }

    async loadFolder(folderName, files) {
        return await loadProject(folderName, files);
    }

    async loadDefault(projectName = 'projects/default') {
        return await loadProject(projectName);
    }

}

async function loadProject(projectName, fileList=null) {
    const reader = fileList === null ? new DefaultReader() : new FolderReader(projectName, fileList);
    const config = await reader.readJson(`${projectName}/config.json`)
    const labels = config?.labels?.visible || [];

    const nodes = {};
    labels.forEach(async key => {
        nodes[key] = await reader.readJson(`${projectName}/nodes/${key}.json`);
    });
    return new Project(
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
