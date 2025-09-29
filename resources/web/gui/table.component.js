import {BaseComponent} from "./core/base.component.js";
import {P} from "../project/project.service.js";

const STYLE = `
[name=table-internal] {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: calc(100% - 0);
  max-height: calc(75% - 10cm);
  
  z-index: 1000;
  overflow: auto;
}
`;

const TEMPLATE = `<div name="table-internal" class="table-internal"></div>`;

export class TableComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
        });
        this.table = new Tabulator(this.getPanel('table-internal'), {
            layout: 'fitDataStretch',
            responsiveLayout: true,
            autoResize: true,
        });
        this.table.on('tableBuilt', () => this.table.redraw());
    }

    async rebuild() {
        const labels = P.project.labels();
        console.log(`table.rebuild: ${labels}`)
        const columns = this.generateColumnDefs(labels);
        const rowData = P.project.relation().nodes().map(id =>
            labels.reduce((row, label) => {
                // row[label] = M.read(label, id);
                row[label] = P.project.read(label, id);
                return row;
            }, {module: id})
        );

        this.table.setColumns(columns);
        this.table.replaceData(rowData);
    }

    generateColumnDefs(labels) {
        return ['module', ...labels].map(field => ({
            title: field,
            field,
            headerSort: true,
            resizable: true,
            responsive: true,
        }));
    }
}
