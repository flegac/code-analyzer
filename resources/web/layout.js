const LAYOUT = new GoldenLayout({
    settings: {
        // hasHeaders: false,
    },
    content: [{
        type: 'row',
        content: [
            {
                type: 'stack',
                width: 15,
                content: [
                    {
                        type: 'component',
                        componentName: 'graph-controller',
                        componentState: {label: 'Graph Controller'},
                    },
                    {
                        type: 'component',
                        componentName: 'tree-view',
                        componentState: {label: 'Tree View'},
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
                ]
            }]
    }]
});
