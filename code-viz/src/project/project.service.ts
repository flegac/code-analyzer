import { Project } from "./project.model.js";
import { SS } from "../core/store.service.js";
import { Config } from "../filter/graph.filter.js";



export interface FeatureMap {
    [nodeId: string]: any;
};

export interface FeatureMaps {
    [nodeId: string]: FeatureMap;
};

class DefaultReader {
    async readJson(path: string) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (e) {
            console.warn(`Erreur de chargement : ${path}`, e);
            return null;
        }
    }

    async readFeatures(projectName: string, nodeValues?: string[] | null) {
        const nodes: FeatureMaps = {};

        if (Array.isArray(nodeValues)) {
            for (const key of nodeValues) {
                nodes[key] = await this.readJson(`${projectName}/nodes/${key}.json`);
            }
        }
        return nodes;
    }

}

export class ProjectService {
    static singleton = new ProjectService();
    reader: DefaultReader;
    project: Project | null;

    constructor() {
        this.reader = new DefaultReader();
        this.project = null;
        console.log('initialize', this);
    }


    //----- modifications ---------------------------------------------------

    loadProject(project: Project) {
        this.project = project;
        return project;
    }

    async loadFolder(folderName: string, files: FileList) {
        return await loadProject(folderName, files);
    }

    async loadDefault() {
        const config = await this.reader.readJson('projects/config.json');
        console.log('[DEFAULT] config loaded', config);
        return await loadProject(`projects/${config.project}`);
    }
}

export const P = ProjectService.singleton;

async function loadProject(projectName: string, fileList: FileList | null = null) {
    const reader = fileList === null ? new DefaultReader() : new FolderReader(projectName, fileList);
    console.log(`[${projectName}] loading config ...`);

    // config
    const config: Config = await reader.readJson(`${projectName}/config.json`)
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
    const nodes: FeatureMaps = await reader.readFeatures(projectName, nodeValues);
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
    projectName: string;
    files: File[];
    fileMap: { [k: string]: File; };
    constructor(projectName: string, fileList: FileList) {
        this.projectName = projectName;
        this.files = Array.from(fileList);
        this.fileMap = Object.fromEntries(this.files.map(f => [f.webkitRelativePath, f]));
    }

    async readJson(path: string) {
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


    async readFeatures(projectName: string, nodeValues?: string[] | null) {
        const nodes: FeatureMaps = {};
        const nodePrefix = `${projectName}/nodes/`;
        Object.entries(this.fileMap).forEach(async ([path, file]) => {
            if (path.startsWith(nodePrefix) && path.endsWith('.json')) {
                const key = path.slice(nodePrefix.length, -'.json'.length);
                nodes[key] = await this.readJson(path);
            }
        });
        return nodes;
    }

}
