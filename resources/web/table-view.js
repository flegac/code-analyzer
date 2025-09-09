class TableView {
    constructor(container_id = 'data-table') {
        this.container = createDiv(container_id, "ag-theme-alpine ag-preload");
        const panel = createDiv('resizable-panel');
        const handle = createDiv('resize-handle');
        panel.appendChild(handle);
        panel.appendChild(this.container);

        this.gridInstance = null;

        loadCSS('https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css');
        loadCSS('https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css');
        loadScript("https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js");
    }

    render(data) {
        const columnDefs = this.generateColumnDefs(data);

        // 🔄 Transformation de l'objet en tableau de lignes
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
        }).observe(document.getElementById('data-table'));


        const panel = document.getElementById('resizable-panel');
        const handle = document.getElementById('resize-handle');

        let isResizing = false;

        handle.addEventListener('mousedown', e => {
            isResizing = true;
            document.body.style.cursor = 'ns-resize';
        });

        document.addEventListener('mousemove', e => {
            if (!isResizing) return;
            const newHeight = window.innerHeight - e.clientY;
            panel.style.height = `${newHeight}px`;
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = 'default';
        });


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