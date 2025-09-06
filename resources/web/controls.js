class Controls {
    constructor(id = 'controls') {
        this.container = createDiv(id, 'my-box controls');
        this.container.innerHTML = `
<label for="data-path">Fichier JSON :</label><br>
<select id="data-path">
    <option value="../graph.json">graph.json</option>
</select><br><br>

<label for="graph-dimension">Projection dimension</label><br>
<select id="graph-dimension">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3" selected>3</option>
</select><br><br>

<label for="module-prefix-depth">Profondeur du préfixe :</label><br>
<select id="module-prefix-depth">
    <option value="0">0</option>
    <option value="1" selected>1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
</select><br><br>

<label for="group-force-strength">group force strength :</label>
<input type="range" id="group-force-strength" min="0" max=".2" step="0.01" value=".1">
<span id="group-force-strength-value">.1</span><br><br>

<label for="group-force-distance">group force distance :</label>
<input type="range" id="group-force-distance" min="1" max="100" step=".1" value="50">
<span id="group-force-distance-value">50</span><br><br>

<button id="reloadBtn">Reload</button>
`;

        this.WIDGETS = {
            graph: document.getElementById('graph'),
            dataPath: document.getElementById('data-path'),
            modulePrefixDepth: document.getElementById('module-prefix-depth'),
            dimension: document.getElementById('graph-dimension'),
            groupForceStrength: document.getElementById('group-force-strength'),
            groupForceDistance: document.getElementById('group-force-distance'),
        };
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

    groupForceStrength() {
        return parseFloat(this.WIDGETS.groupForceStrength.value).toFixed(2);
    }

    groupForceDistance() {
        return parseFloat(this.WIDGETS.groupForceDistance.value).toFixed(2);
    }


}