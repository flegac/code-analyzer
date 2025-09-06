class Controls {
    constructor(graph, id = 'controls') {
        this.container = createDiv(id, 'my-box controls');
        this.container.innerHTML = `
<label for="data-path">Fichier JSON :</label><br>
<select id="data-path">
    <option value="graph.json">graph.json</option>
</select><br>

<label for="graph-dimension">Projection dimension</label><br>
<select id="graph-dimension">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3" selected>3</option>
</select><br>

<label for="module-prefix-depth">Profondeur du préfixe :</label><br>
<select id="module-prefix-depth">
    <option value="0">0</option>
    <option value="1" selected>1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
</select><br>

<label for="charge-strength">charge-strength</label> [<span id="charge-strength-value">50</span>]<br>
<input type="range" id="charge-strength" min="1" max="100" step=".1" value="50"><br>


<label for="link-distance">link-distance</label> [<span id="link-distance-value">10</span>]<br>
<input type="range" id="link-distance" min="1" max="100" step=".1" value="10"><br>


<label for="group-distance">group-distance</label> [<span id="group-distance-value">50</span>]<br>
<input type="range" id="group-distance" min="1" max="100" step=".1" value="50"><br>


<button id="reloadBtn">Reload</button>
`;

        this.WIDGETS = {
            dataPath: document.getElementById('data-path'),
            modulePrefixDepth: document.getElementById('module-prefix-depth'),
            dimension: document.getElementById('graph-dimension'),
            chargeStrength: document.getElementById('charge-strength'),
            linkDistance: document.getElementById('link-distance'),
            groupDistance: document.getElementById('group-distance'),
        };

        this.WIDGETS.dimension.addEventListener('input', async () => {
            await this.rebuildGraph(graph);
        });

        this.WIDGETS.modulePrefixDepth.addEventListener('input', async () => {
            await this.rebuildGraph(graph);
        });

        this.WIDGETS.chargeStrength.addEventListener('input', () => {
            document.getElementById('charge-strength-value').textContent = this.chargeStrength()
            this.updateGraph(graph);
        });
        this.WIDGETS.linkDistance.addEventListener('input', () => {
            document.getElementById('link-distance-value').textContent = this.linkDistance()
            this.updateGraph(graph);
        });
        this.WIDGETS.groupDistance.addEventListener('input', () => {
            document.getElementById('group-distance-value').textContent = this.groupDistance()
            this.updateGraph(graph);
        });
        this.WIDGETS.dimension.addEventListener('input', () => {
            this.updateGraph(graph);
        });

    }

    dataPath() {
        return this.WIDGETS.dataPath.value
    }

    modulePrefixDepth() {
        return parseInt(this.WIDGETS.modulePrefixDepth.value, 10);
    }

    dimension() {
        return parseInt(this.WIDGETS.dimension.value, 10);
    }

    chargeStrength() {
        return parseFloat(this.WIDGETS.chargeStrength.value).toFixed(2);
    }

    linkDistance() {
        return parseFloat(this.WIDGETS.linkDistance.value).toFixed(2);
    }

    groupDistance() {
        return parseFloat(this.WIDGETS.groupDistance.value).toFixed(2);
    }


    updateGraph(graph) {
        graph.updateGraph(this);
    }

    async rebuildGraph(graph) {
        graph.data = await fetch(this.dataPath()).then(res => res.json());

        graph.renderGraph(display.controls.modulePrefixDepth(), display.paletteGenerator)
        this.updateGraph(graph)
    }

}