import {Metadata} from "/project/metadata.model.js";
import {ClusterService} from "/cluster/cluster.service.js";
import { GraphService } from "/display/graph.service.js";
import { StyleService } from "/display/style.service.js";

export class NodeService extends Metadata {
    static singleton = new NodeService();

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

        G.state.nodes.forEach(node => {
            const group = C.groupStrategy.apply(node);
            node.write('group', group);
        });
    }

    updateRadius() {
        const G = GraphService.singleton;
        const S = StyleService.singleton;
        const sizeLabel = S.mesh.size;
        const scaling = S.mesh.scaling;

        G.state.nodes.forEach(node => {
            const value = node.read(sizeLabel) ?? 1;
            const radius = Math.max(1, Math.cbrt(1 + value));
            node.write('radius', radius * scaling);
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
            node.write('outgoing', []);
            node.write('incoming', []);
        });
        G.state.links.forEach(link => {
            const source = G.findNodeById(link.source.id || link.source);
            const target = G.findNodeById(link.target.id || link.target);

            source.read('outgoing').push(target.id);
            target.read('incoming').push(source.id);
        });
    }
}