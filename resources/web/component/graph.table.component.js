import {BaseComponent} from "/component/base.component.js";

const STYLE = `
.graph-table {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 1cm);
  max-height: calc(75% - 2cm);
  
  z-index: 1000;
  overflow: auto;
}
`;

const TEMPLATE = `
<div name="graph-table" class="graph-table">
</div>
`

export class GraphTableComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
        });
        this.toggleVisibility({visible: false});
        this.table = null;
    }

    async rebuild(data) {
        if (!data) return;

        const columns = this.generateColumnDefs(data);
        const rowData = Object.entries(data).map(([module, metrics]) => ({module, ...metrics}));

        if (!this.table) {
            // Première initialisation
            this.table = new Tabulator(this.getPanel('graph-table'), {
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
