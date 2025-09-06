class Infos {
    constructor(id = 'infos') {
        this.container = createDiv(id, 'my-box infos');
    }

    render(graph) {
        this.container.innerHTML = `<div>
<span>nodes: ${graph.nodes.length}</span>
<span>links: ${graph.links.length}</span>
</div>`
    }
}