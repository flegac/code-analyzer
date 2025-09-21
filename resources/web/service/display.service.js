import {LayoutService} from "/service/layout.service.js"
import {GraphService} from "/service/graph.service.js"
import {GraphDisplay} from "/model/graph.display.model.js";

function interpolateColor(value, min = 0, max = 1) {
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));

    const r = Math.round(255 * ratio);
    const g = 0;
    const b = Math.round(255 * (1 - ratio));

    return `rgb(${r},${g},${b})`;
}


function defaultDisplayProvider() {
    const display = new GraphDisplay()
    const links = DisplayService.singleton.links;

    Object.assign(display.link, {
        color: link => {
            if (link.label === 'hierarchy') {
                return links[link.label]?.color ?? '#f00';
            }

            if (link.label === 'relation') {
                if (link.source.group === link.target.group) {
                    return '#ccc'
                }

                const centrality1 = link.source.infos.centrality;
                const centrality2 = link.target.infos.centrality;
                return interpolateColor((centrality1 + centrality2) / 2);
            }
            return links[link.label]?.color ?? '#f00';
        },
        visibility: link => {
            const width = links[link.label]?.width;
            return width > 0;
        },
        width: link => {
            return links[link.label]?.width;
        },
        particleNumber: link => {
            if (link.label !== 'hierarchy' && link.source.group === link.target.group) {
                return 0;
            }
            return links[link.label]?.particles ?? 0;
        },
        particleWidth: link => {
            return 2 * links[link.label]?.width ?? 0;
        },
    });
    return display;
}



class Nodes {
    constructor() {
        this.mesh = {
            baseRadius: 12.0,
            isVisible: true,
            colorGroupDepthRange: 2,
            size: 'imported',
            color: 'group',
        }
        this.text = {
            isVisible: true,
            hiddenDepthRange: 3,
            scaling: 2.0,
            padding: 2,
            fontSize: 64,
            fontFamily: 'Arial',
            textColor: 'white',
            textOffsetY: 10,
            textFormatter: (parts) => {
                if (!Array.isArray(parts) || parts.length === 0) return '';
                if (parts.length === 1) return parts[0];
                // if (parts.length === 2) return parts.join('.');
                return parts.slice(-1);
            }
        };
    }
}

class Links {
    constructor() {
        this.relation = {
            color: '#f00',
            particles: 1,
            width: 5.0,
        };
        this.hierarchy = {
            color: '#ffff00',
            particles: 0,
            width: 10.0,
        };
    }
}

export class DisplayService {
    static singleton = new DisplayService();

    constructor() {
        this.nodes = new Nodes();
        this.links = new Links();
        this.displayProvider = defaultDisplayProvider
        console.log('initialize', this);
    }

    async apply() {
        const graph = LayoutService.singleton.graph;
        const state = DisplayService.singleton.nodes;

        GraphService.singleton.updateDisplayParameters();

        const displayProvider = this.displayProvider();
        await displayProvider.apply(graph, state);

    }
}
