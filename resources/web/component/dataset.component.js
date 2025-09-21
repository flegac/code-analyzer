import {BaseComponent} from "/component/base.component.js";
import {DatasetService} from "/service/dataset.service.js"

const TEMPLATE = `
<div id="dataset-controller" style="display: flex; flex-direction: column; gap: 0.5em; padding: 1em;">
  <input type="file" name="file-browser" style="display: none;" webkitdirectory></input>
</div>
`;

export class DatasetComponent extends BaseComponent {
    constructor() {
        super({
            id: "dataset-gui",
            template: TEMPLATE
        })

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