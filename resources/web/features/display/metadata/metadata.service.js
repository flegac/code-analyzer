import { DatasetService } from "/dataset/dataset.service.js"
import { GraphService } from "/display/graph.service.js"
import { StyleService } from "/display/style.service.js"
import { ClusterService } from "/cluster/cluster.service.js"

export class MetadataService {
    static singleton = new MetadataService()


    constructor() {
        this._metadata = {
            // key => nodeId => value
        }
    }

    labels() {
        return [...Object.keys(this._metadata)];
    }

    write(key, id, value) {
        this._metadata ??= {};
        this._metadata[key] ??= {};
        this._metadata[key][id] = value;
    }

    read(key, id) {
        return this._metadata?.[key]?.[id] ?? null;
    }

    readAll(id) {
        const result = {};
        if (!this._metadata) return result;

        for (const key of Object.keys(this._metadata)) {
            result[key] = this.read(key, id);
        }

        return result;
    }


    updateMetrics(metrics) {
        const G = GraphService.singleton;
        G.state.nodes.forEach(node => {
            const value = metrics.getValue(node);
            node.write(metrics.name, value);
        });
    }

    updateGroup() {

        const G = GraphService.singleton;
        const C = ClusterService.singleton;
        console.log('updateGroup', C.groupStrategy);


        G.state.nodes.forEach(node => {
            const group = C.groupStrategy.apply(node);
            node.write('group', group);
        });
    }

    updateRadius() {
        const G = GraphService.singleton;
        const S = StyleService.singleton;
        const sizeLabel = S.nodes.mesh.size;

        G.state.nodes.forEach(node => {
            const value = node.read(sizeLabel) ?? 1;
            const radius = Math.max(1, Math.cbrt(1 + value));
            node.write('radius', radius);
        });
    }

    updateColor() {
        const G = GraphService.singleton;
        const groups = [...new Set(G.state.nodes.map(node => node.read('group')))];

        const colorScale = chroma.scale('Paired').mode('lch').colors(groups.length);
        const groupColorMap = {};
        groups.forEach((group, index) => {
            groupColorMap[group] = colorScale[index];
        });

        G.state.nodes.forEach(node => {
            const group = node.read('group');
            const color = groupColorMap[group] ?? '#ccc';
            node.write('color', color);
        });
    }


    updateNavigation() {
        const G = GraphService.singleton;
        // connectivity stats
        G.state.nodes.forEach(node => {
            this.write('outgoing', node.id, [])
            this.write('incoming', node.id, [])
        });
        G.state.links.forEach(link => {
            this.read('outgoing', link.source).push(link.target);
            this.read('incoming', link.target).push(link.source);
        });
    }



}