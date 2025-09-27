import {BaseComponent} from "./core/base.component.js"
import {GraphService} from "../display/graph.service.js"
import {CameraService} from "../camera.service.js"

const STYLE = `
.graph-navigation {
  position: absolute;
  width: 300px;
  height: 100%;
  
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  z-index: 1000;
  box-shadow: var(--sl-shadow-large);
  border-radius: var(--sl-border-radius-medium);
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.drawer-cards {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
`;

const TEMPLATE = `
<div name="graph-navigation" class="graph-navigation">
  <h2 id="nav-title" class="nav-title">Navigation</h2>

  <section class="nav-section">
    <h3 class="nav-heading">Entrées</h3>
    <sl-menu id="nav-incoming" class="nav-menu"></sl-menu>
  </section>

  <section class="nav-section">
    <h3 class="nav-heading">Sorties</h3>
    <sl-menu id="nav-outgoing" class="nav-menu"></sl-menu>
  </section>
</div>
`;


export class NavigationComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE
        });
        this.updateMenu();

        this.onClick = (id) => {
            const node = GraphService.singleton.findNodeById(id);
            CameraService.singleton.focusOn(node);
            GraphService.singleton.select(node);
        };


        this.boundUpdate = this.updateMenu.bind(this);
        GraphService.singleton.onSelectionChange(this.boundUpdate);
    }


    updateMenu() {
        const incomingMenu = this.container.querySelector('#nav-incoming');
        const outgoingMenu = this.container.querySelector('#nav-outgoing');
        const title = this.container.querySelector('#nav-title');


        incomingMenu.innerHTML = '';
        outgoingMenu.innerHTML = '';


        const selected = GraphService.singleton.state.selected;
        if (selected === null) return;

        const incoming = selected.read('incoming');
        const outgoing = selected.read('outgoing');

        const nodeName = selected?.id || 'Navigation';


        title.textContent = nodeName.split('.').slice(-1).join('.');

        incoming.forEach(item => {
            const menuItem = document.createElement('sl-menu-item');
            menuItem.value = item;
            menuItem.textContent = item.split('.').slice(-1).join('.');
            menuItem.addEventListener('click', () => this.onClick(item));
            incomingMenu.appendChild(menuItem);
        });

        outgoing.forEach(item => {
            const menuItem = document.createElement('sl-menu-item');
            menuItem.value = item;
            menuItem.textContent = item.split('.').slice(-1).join('.');
            menuItem.addEventListener('click', () => this.onClick(item));
            outgoingMenu.appendChild(menuItem);
        });
    }
}
