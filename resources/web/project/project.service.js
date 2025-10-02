import { Project } from "./project.model.js"
import { SS } from "../store.service.js"

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

export class ProjectService {
    static singleton = new ProjectService();

    constructor() {
        this.reader = new DefaultReader();
        this.project = null;
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

    async loadDefault() {
        const config = await this.reader.readJson('projects/config.json');
        console.log('[DEFAULT] config loaded', config);
        return await loadProject(`projects/${config.project}`);
    }
}

export const P = ProjectService.singleton;

async function loadProject(projectName, fileList = null) {
    const reader = fileList === null ? new DefaultReader() : new FolderReader(projectName, fileList);
    console.log(`[${projectName}] loading config ...`);

    // config
    const config = await reader.readJson(`${projectName}/config.json`)
    const nodeValues = config?.nodeValues || null;

    // relation
    const relationId = config?.relation || 'relation';
    const relation = await reader.readJson(`${projectName}/${relationId}.json`);
    console.log(`[${projectName}] relation "${relationId}" loaded`, relation);

    // presets
    const presetId = config?.preset || 'default';
    const preset = await reader.readJson(`${projectName}/presets/${presetId}.preset.json`);
    if (preset.physics) {
        SS.update('physics', preset.physics);
        SS.update('visuals', preset.visuals);
    }
    console.log(`[${projectName}] preset "${presetId}" loaded`, preset);

    // nodes data
    const nodes = {};
    const nodePrefix = `${projectName}/nodes/`;
    if (fileList !== null) {
        Object.entries(reader.fileMap).forEach(async ([path, file]) => {
            if (path.startsWith(nodePrefix) && path.endsWith('.json')) {
                const key = path.slice(nodePrefix.length, -'.json'.length);
                nodes[key] = await reader.readJson(path);
            }
        });
    } else if (Array.isArray(nodeValues)) {
        for (const key of nodeValues) {
            nodes[key] = await reader.readJson(`${projectName}/nodes/${key}.json`);
        }
    }
    console.log(`[${projectName}] node data loaded`, nodes);

    const project = new Project(
        projectName,
        relation,
        nodes,
        config,
    );
    console.log(`[${projectName}] project loaded`, project);

    return project;
}


class FolderReader {
    constructor(projectName, fileList) {
        this.projectName = projectName;
        this.files = Array.from(fileList);
        this.fileMap = Object.fromEntries(this.files.map(f => [f.webkitRelativePath, f]));
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
