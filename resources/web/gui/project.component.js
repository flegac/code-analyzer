import {BaseComponent} from "./core/base.component.js";
import {P} from "../project/project.service.js"
import {LL} from "../layout.service.js"

export class ProjectComponent extends BaseComponent {
    constructor() {
        super({
            template: `<input type="file" name="file-browser" webkitdirectory></input>`,
        })
        this.toggleVisibility({visible: false})

        // 📂 Charger un fichier
        this.fileBrowser = this.getPanel('file-browser');
        this.fileBrowser.addEventListener('change', async event => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            const folderName = files[0].webkitRelativePath.split('/')[0];
            const project = await P.loadFolder(folderName, files);
            await LL.changeProject(project);
        });
    }

    openBrowser() {
        this.fileBrowser.click()
    }


}