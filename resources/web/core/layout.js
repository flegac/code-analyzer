const LAYOUT = new GoldenLayout({
    settings: {
        // hasHeaders: false,
    },
    content: [{
        type: 'row',
        content: [
            {
                type: 'stack',
                content: [
                    {
                        type: 'component',
                        componentName: 'control-view',
                        componentState: { label: 'Graph Controller' },
                    },
                    {
                        type: 'component',
                        componentName: 'tree-view',
                        componentState: { label: 'Tree View' },
                    },
                ]
            },
            {
                type: 'stack',
                content: [
                    {
                        type: 'component',
                        componentName: 'graph-view',
                        componentState: { label: 'Graph View' }
                    },
                    {
                        type: 'component',
                        componentName: 'table-view',
                        componentState: { label: 'Table View' }
                    },
                ]
            }]
    }]
});



function loadLayout(providerMap) {
    Object.entries(providerMap).forEach(([key, provider]) => {
        LAYOUT.registerComponent(key, function (container, componentState) {
            (async () => {
                const elt = container.getElement();
                const providers = await provider();
                providers.forEach(x => elt.append(x));
            })();
        });
    });
    LAYOUT.init();
}
