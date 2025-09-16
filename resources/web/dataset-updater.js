class DatasetUpdater {
    constructor(updater) {
        this.updater = updater
    }

    async apply() {
        const dependencies = await this.dependencies()
        this.updater.layout.tree.rebuild(MyGraph.hierarchy(dependencies));
    }

    state() {
        return this.updater.state.dataset
    }

    async loadConfig() {
        return await fetch(this.state().configPath).then(res => res.json());
    }

    async dependencies() {
        if (this.state().dataset === null) {
            this.state().dataset = await fetch(this.state().datasetPath).then(res => res.json());
            console.log(`loading from ${this.state().datasetPath}`);
        }
        let raw = this.state().dataset;
        const config = await this.loadConfig();
        const filtered = new GraphFilter(config).apply(raw);
        return new MyGraph('dependencies', filtered);
    }

    async moduleInfos() {
        return await fetch(this.state().moduleInfosPath).then(res => res.json());
    }
}
