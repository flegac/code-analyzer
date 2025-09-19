export class BaseComponent {
    constructor(id, template) {
        this.container = document.createElement("div");
        this.container.id = id;
        this.container.innerHTML = template;
    }
}
