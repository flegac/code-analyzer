class TableView {
    constructor(container_id = 'data-table') {
        this.container = window.document.createElement('div');
        this.container.id = container_id
        this.container.className = "ag-theme-alpine ag-preload";

        this.gridInstance = null;
        loadCSS('https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css');
        loadCSS('https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css');

    }

    async rebuild(data) {
        await loadScriptAsync("https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js");

        const columnDefs = this.generateColumnDefs(data);
        const rowData = Object.entries(data).map(([moduleName, metrics]) => ({
            module: moduleName,
            ...metrics
        }));
        agGrid.createGrid(this.container, {
            theme: 'legacy',
            columnDefs: columnDefs,
            rowData: rowData,
            groupDisplayType: 'groupRows',
            // suppressRowGroupHidesColumns: true,
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
                // editable: true,
            },
            onGridReady: params => {
                this.gridInstance = params;
                const allColumnIds = params.api.getColumnDefs().map(col => col.field);
                params.api.autoSizeColumns(allColumnIds);
                this.container.classList.remove('ag-preload');
                this.container.classList.add('ag-visible');
            }
        });

        new ResizeObserver(() => {
            if (this.gridInstance?.api) {
                this.gridInstance.api.sizeColumnsToFit();
            }
        }).observe(this.container);

    }

    generateColumnDefs(data) {
        const firstRow = Object.values(data)[0];
        const keys = Object.keys(firstRow);

        return ['module', ...keys].map(field => ({
            headerName: field,
            field: field,
            sortable: true,
            filter: true,
            resizable: true
        }));
    }


}