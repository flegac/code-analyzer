class Infos {
    constructor(id = 'infos') {
        this.container = window.document.createElement('div');
        this.container.id = id
    }

    rebuild(graph) {
        this.container.innerHTML = `<div>
<span>hierarchy: (V=${graph.hierarchy.nodes.size}, E=${graph.hierarchy.links.length})</span><br>
<span>dependencies: (V=${graph.dependencies.nodes.size}, E=${graph.dependencies.links.length})</span>
</div>`;
    }
}