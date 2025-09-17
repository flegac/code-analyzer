import {GraphDisplay} from "graph-display";

export function defaultDisplayProvider(state) {
    const display = new GraphDisplay()
    Object.assign(display.link, {
        color: link => {
            if (link.label !== 'hierarchy' && link.source.group === link.target.group) {
                return '#ccc'
            }
            return state.links[link.label]?.color ?? '#f00';
        },
        width: link => {
            return state.links[link.label]?.width
        },
        particleNumber: link => {
            if (link.label !== 'hierarchy' && link.source.group === link.target.group) {
                return 0;
            }
            return state.links[link.label]?.particles ?? 0;
        },
        particleWidth: link => {
            return 2 + state.links[link.label]?.width * .5;
        },
    });
    return display;
}