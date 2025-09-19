export class TableComponent {
    constructor(id = 'table-view') {
        this.container = document.createElement('div');
        this.container.id = id;
        this.container.className = 'tabulator-preload';
        this.table = null;
    }

    async rebuild(data) {
        if (!data) return;

        const columns = this.generateColumnDefs(data);
        const rowData = Object.entries(data).map(([module, metrics]) => ({module, ...metrics}));

        if (!this.table) {
            // Première initialisation
            this.table = new Tabulator(this.container, {
                layout: 'fitDataStretch',
                responsiveLayout: true,
                autoResize: true,
                columns,
                data: rowData,
            });

            this.table.on('tableBuilt', () => this.table.redraw());
        } else {
            // Mise à jour sans recréer
            this.table.setColumns(columns);
            this.table.replaceData(rowData);
        }
    }

    generateColumnDefs(data) {
        const keys = Object.keys(Object.values(data)[0] || {});
        return ['module', ...keys].map(field => ({
            title: field,
            field,
            headerSort: true,
            resizable: true,
            responsive: true,
        }));
    }
}
