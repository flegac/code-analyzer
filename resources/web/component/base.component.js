export class BaseComponent {

    constructor(id, template, style = null) {
        this.container = document.createElement("div");
        this.container.id = id;
        this.container.innerHTML = template;
        if (style !== null) {
            this.style = document.createElement('style');
            this.style.textContent = style;
            //TODO: only load CSS once !
            document.head.appendChild(this.style);
        }
    }
}