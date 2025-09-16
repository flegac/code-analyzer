class DatasetUpdater {
    constructor(app) {
        this.app = app
    }

    async apply() {
        const dependencies = await this.dependencies()
        this.app.layout.tree.rebuild(MyGraph.hierarchy(dependencies));
    }

    state() {
        return this.app.state.dataset
    }

    async loadConfig() {
        return await fetch(this.state().configPath).then(res => res.json());
    }

    async dependencies() {
        if (this.app.state.dataset.dataset === null) {
            this.app.state.dataset.dataset = await fetch(this.app.state.dataset.datasetPath).then(res => res.json());
            console.log(`loading from ${this.app.state.dataset.datasetPath}`);
        }
        let raw = this.state().dataset;
        const config = await this.loadConfig();
        const filtered = new GraphFilter(config).apply(raw);
        // const collapsed = new GraphTransformer(
        //     new GroupStrategy(
        //         this.app.state.dataset.rootCollapseLevel,
        //     ).apply
        // ).apply(filtered);
        return new MyGraph('dependencies', filtered);
    }

    async moduleInfos() {
        return await fetch(this.state().moduleInfosPath).then(res => res.json());
    }
}
