class Infos {
    constructor(id = 'infos') {
        this.container = createDiv(id, 'my-box infos');
    }

    render(graph) {
        this.container.innerHTML = `<div>
<span>hierarchy: nodes=${graph.hierarchy.nodes.size} links: ${graph.hierarchy.links.length}</span><br>
<span>dependencies: nodes=${graph.dependencies.nodes.size} links: ${graph.dependencies.links.length}</span>
</div>`
    }
}