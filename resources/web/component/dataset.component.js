import {BaseComponent} from "/component/base.component.js";
import {DatasetService} from "/service/dataset.service.js"

const TEMPLATE = `
<input type="file" name="file-browser" webkitdirectory></input>
`;

export class DatasetComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE
        })
        this.toggleVisibility({visible: false})

        // 📂 Charger un fichier
        this.fileBrowser = this.getPanel('file-browser');
        this.fileBrowser.addEventListener('change', async event => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            const folderName = files[0].webkitRelativePath.split('/')[0];
            const dataset = await DatasetService.singleton.load(folderName, files);
            await DatasetService.singleton.changeDataset(dataset);
        });
    }

    openBrowser() {
        this.fileBrowser.click()
    }


}