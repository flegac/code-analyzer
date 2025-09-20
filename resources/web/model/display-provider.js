import {GraphDisplay} from "/model/graph.display.model.js";
import {DisplayService} from "/service/display.service.js"

function interpolateColor(value, min = 0, max = 1) {
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));

    const r = Math.round(255 * ratio);
    const g = 0;
    const b = Math.round(255 * (1 - ratio));

    return `rgb(${r},${g},${b})`;
}


export function defaultDisplayProvider() {
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
