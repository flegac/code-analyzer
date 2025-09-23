import {GraphStyleService} from "/display/graph.style.service.js";
import {GraphService} from "/display/graph.service.js";

export class LinkStyle {
    constructor() {
        this.relation = {
            color: '#f00',
            opacity: .01,
            colorLow: '#0f0',
            colorHigh: '#f00',
            particles: 1,
            width: 2.0,
        };
        this.hierarchy = {
            color: '#fff',
            opacity: .01,
            colorLow: '#fff',
            colorHigh: '#fff',
            particles: 0,
            width: 10.0,
        };
    }

    getOpacity(link) {
        const links = GraphStyleService.singleton.links;
        console.log(links[link.label]?.opacity)
        return links[link.label]?.opacity;
    }

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
            const c1 = this.relation.colorLow;
            const c2 = this.relation.colorHigh;
            return interpolateColor(c1, c2, (centrality1 + centrality2) / 2);
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

function interpolateColor(c1, c2, value, min = 0, max = 1) {
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // Convertir #rgb en [r, g, b]
    const hexToRGB = hex => {
        const r = parseInt(hex[1] + hex[1], 16);
        const g = parseInt(hex[2] + hex[2], 16);
        const b = parseInt(hex[3] + hex[3], 16);
        return [r, g, b];
    };

    const [r1, g1, b1] = hexToRGB(c1);
    const [r2, g2, b2] = hexToRGB(c2);

    // Interpolation linéaire
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `rgb(${r},${g},${b})`;
}
