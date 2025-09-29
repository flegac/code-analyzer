import { Metadata } from "../project/metadata.model.js";
import { CC } from "./cluster.service.js";
import { G } from "./graph.service.js";
import { V } from "./visual.service.js";
import { P } from "../project/project.service.js";
import { ClosenessCentrality } from "./metrics/closeness.centrality.metrics.js";
import { CycleCounter } from "./metrics/cycle.count.metrics.js";

export class NodeService extends Metadata {
    static singleton = new NodeService();

    updateMetrics(metrics = null) {
        if (metrics === null) {
            const relation = P.project.relation();
            if (V.state.links.metrics === 'centrality') {
                metrics = new ClosenessCentrality(relation)
            } else if (V.state.links.metrics === 'cycles') {
                metrics = new CycleCounter(relation);
            }
        }

        G.state.nodes.forEach(node => {
            const value = metrics.getValue(node);
            node.write(metrics.name, value);
        });
    }

    updateGroup() {
        G.state.nodes.forEach(node => {
            const group = CC.groupStrategy.apply(node);
            node.write('group', group);
        });
    }

    updateRadius() {
        const size = V.state.mesh.size;
        const scaling = V.state.mesh.scaling;

        G.state.nodes.forEach(node => {
            const value = node.read(size) ?? 1;
            const radius = V.expectdRadius(value);

            node.write('radius', radius);
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
            node.write('relation.in', []);
            node.write('relation.out', []);
            node.write('hierarchy.in', []);
            node.write('hierarchy.out', []);
        });
        G.state.links.forEach(link => {
            const label = link.label;
            const source = G.findNodeById(link.source.id || link.source);
            const target = G.findNodeById(link.target.id || link.target);


            if (label === 'hierarchy') {
                target.read('hierarchy.in').push(source.id);
                source.read('hierarchy.out').push(target.id);
            }

            if (label === 'relation') {
                target.read('relation.in').push(source.id);
                source.read('relation.out').push(target.id);
            }
        });
    }
}
export const NN = NodeService.singleton;