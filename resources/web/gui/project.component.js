import {BaseComponent} from "./core/base.component.js";
import {ProjectService} from "../project/project.service.js"
import {LayoutService} from "../layout.service.js"

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
            const project = await ProjectService.singleton.loadFolder(folderName, files);
            await LayoutService.singleton.changeProject(project);
        });
    }

    openBrowser() {
        this.fileBrowser.click()
    }


}