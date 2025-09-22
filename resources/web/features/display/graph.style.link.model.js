import { GraphStyleService } from "/display/graph.style.service.js";
import { GraphService } from "/display/graph.service.js";

export class GraphLinkStyle {
    getWidth(link) {
        const links = GraphStyleService.singleton.links;
        return links[link.label]?.width;
    }
    getColor(link) {
        const links = GraphStyleService.singleton.links;
        const G = GraphService.singleton;

        if (link.label === 'hierarchy') {
            return links[link.label]?.color ?? '#f00';
        }

        if (link.label === 'relation') {
            //TODO: fix that shit !! strange behavior on links ...
            const source = G.findNodeById(link.source.id || link.source);
            const target = G.findNodeById(link.target.id || link.target);

            if (source.group === target.group) {
                return '#ccc';
            }

            const centrality1 = source.infos.centrality;
            const centrality2 = target.infos.centrality;
            return interpolateColor((centrality1 + centrality2) / 2);
        }
        return links[link.label]?.color ?? '#f00';
    }
    getParticleNumber(link) {
        const links = GraphStyleService.singleton.links;

        if (link.label !== 'hierarchy' && link.source.group === link.target.group) {
            return 0;
        }
        return links[link.label]?.particles ?? 0;
    }
    getParticleWidth(link) {
        const links = GraphStyleService.singleton.links;

        return 2 * links[link.label]?.width ?? 0;
    }
    getVisibility(link) {
        const links = GraphStyleService.singleton.links;
        const width = links[link.label]?.width;
        return width > 0;
    }
}

function interpolateColor(value, min = 0, max = 1) {
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));

    const r = Math.round(255 * ratio);
    const g = 0;
    const b = Math.round(255 * (1 - ratio));

    return `rgb(${r},${g},${b})`;
}