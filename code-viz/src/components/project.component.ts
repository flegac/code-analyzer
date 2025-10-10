import { BaseComponent } from "./core/base.component.js";
import { P } from "../project/project.service.js";
import { LL } from "../core/layout.service.js";

export class ProjectComponent extends BaseComponent {
    fileBrowser: HTMLElement;
    constructor() {
        super({
            template: `<input type="file" name="file-browser" webkitdirectory></input>`,
        })
        this.toggleVisibility({ visible: false })

        // 📂 Charger un fichier
        this.fileBrowser = this.getPanel('file-browser');
        if (this.fileBrowser === null) {
            throw Error('FileBrower not found');
        }
        this.fileBrowser.addEventListener('change', async (event: Event) => {
            const input = event.target as HTMLInputElement;
            const files = input.files as FileList | null;
            if (!files || files.length === 0) return;
            const folderName = files[0].webkitRelativePath.split('/')[0];
            console.log(`folder read`, files);
            const project = await P.loadFolder(folderName, files);
            LL.changeProject(project);
        });
    }

    openBrowser() {
        this.fileBrowser.click()
    }

}