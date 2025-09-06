class Legend {
    constructor(id = 'legend') {
        this.container = createDiv(id, 'my-box legend');
    }

    render(graph) {
        const n = Object.entries(graph.groupColors).length;
        this.container.innerHTML = `<strong>Modules principaux [${n}]</strong><br>`;
        for (const [mod, color] of Object.entries(graph.groupColors)) {
            const item = document.createElement('div');
            let span_style = `display:inline-block;width:12px;height:12px;background:${color};margin-right:5px;`;
            item.innerHTML = `<span style="${span_style}"></span> [${graph.groups[mod].length}] ${mod}`;
            this.container.appendChild(item);
        }
    }
}