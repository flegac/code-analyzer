import {Metadata} from "../project/metadata.model.js";
import {ClusterService} from "./cluster/cluster.service.js";
import {G} from "./graph.service.js";
import {V} from "./visual.service.js";
import {P} from "../project/project.service.js";
import {ClosenessCentrality} from "./metrics/closeness.centrality.metrics.js";
import {CycleCounter} from "./metrics/cycle.count.metrics.js";

export class NodeService extends Metadata {
    static singleton = new NodeService();

    updateMetrics(metrics = null) {
        if (metrics === null) {
            const relation = P.project.relation();
            if (V.links.metrics === 'centrality') {
                metrics = new ClosenessCentrality(relation)
            } else if (V.links.metrics === 'cycles') {
                metrics = new CycleCounter(relation);
            }
        }

        G.state.nodes.forEach(node => {
            const value = metrics.getValue(node);
            node.write(metrics.name, value);
        });
    }

    updateGroup() {
        const C = ClusterService.singleton;

        G.state.nodes.forEach(node => {
            const group = C.groupStrategy.apply(node);
            node.write('group', group);
        });
    }

    updateRadius() {
        const sizeLabel = V.mesh.size;
        const scaling = V.mesh.scaling;

        G.state.nodes.forEach(node => {
            const value = node.read(sizeLabel) ?? 1;
            const radius = Math.max(1, Math.cbrt(1 + value));
            node.write('radius', radius * scaling);
        });
    }

    updateColor() {
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