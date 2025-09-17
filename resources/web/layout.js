export const LAYOUT = new GoldenLayout({
    settings: {
        // hasHeaders: false,
    },
    content: [{
        type: 'row',
        content: [
            {
                type: 'stack',
                header: {
                    show: 'top',
                    popout: false,
                    maximise: false,
                    close: false
                },
                content: [
                    {
                        type: 'component',
                        componentName: 'dataset',
                        componentState: {label: 'physics'},
                    },
                    {
                        type: 'component',
                        componentName: 'physics',
                        componentState: {label: 'physics'},
                    },

                    {
                        type: 'component',
                        componentName: 'display',
                        componentState: {label: 'physics'},
                    },


                ]
            },

            {
                type: 'stack',
                content: [
                    {
                        type: 'component',
                        componentName: 'graph-view',
                        componentState: {label: 'Graph View'}
                    },
                    {
                        type: 'component',
                        componentName: 'table-view',
                        componentState: {label: 'Table View'}
                    },

                    {
                        type: 'component',
                        componentName: 'tree-view',
                        componentState: {label: 'Tree View'},
                    },
                ]
            }]
    }]
});


export function loadLayout(providerMap) {
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
