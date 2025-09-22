import { BaseComponent } from "/gui/core/base.component.js";
import { DatasetService } from "/dataset/dataset.service.js"
import { LayoutService } from "/core/layout.service.js"

export class DatasetComponent extends BaseComponent {
    constructor() {
        super({
            template: `<input type="file" name="file-browser" webkitdirectory></input>`,
        })
        this.toggleVisibility({ visible: false })

        // 📂 Charger un fichier
        this.fileBrowser = this.getPanel('file-browser');
        this.fileBrowser.addEventListener('change', async event => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            const folderName = files[0].webkitRelativePath.split('/')[0];
            const dataset = await DatasetService.singleton.loadFolder(folderName, files);
            await LayoutService.singleton.changeDataset(dataset);
        });
    }

    openBrowser() {
        this.fileBrowser.click()
    }


}