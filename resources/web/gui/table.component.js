import { MetadataService } from "/metadata/metadata.service.js";
import { BaseComponent } from "/gui/core/base.component.js";
import { GraphService } from "/display/graph.service.js";
import { DatasetService } from "/dataset/dataset.service.js";

const STYLE = `
[name=table-internal] {
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
        const M = MetadataService.singleton;
        const G = GraphService.singleton;
        const D = DatasetService.singleton;

        const labels = D.state.labels();
        console.log(`table.rebuild: ${labels}`)
        const columns = this.generateColumnDefs(labels);
        const rowData = D.state.relation().nodes().map(id =>
            labels.reduce((row, label) => {
                // row[label] = M.read(label, id);
                row[label] = D.state.read(label, id);
                return row;
            }, { module: id })
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
