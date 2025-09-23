import {BaseComponent} from "/gui/core/base.component.js";
import {GraphService} from "/display/graph.service.js"
import {CameraService} from "/display/camera.service.js"

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
        // initially hidden
        this.toggleVisibility();

        this.updater = () => GraphService.singleton.navigation();
        this.updateMenu();

        this.onClick = (id) => {
            const node = GraphService.singleton.findNodeById(id);
            CameraService.singleton.focusOn(node);
            GraphService.singleton.select(node);
        };


        this.boundUpdate = this.updateMenu.bind(this);
        GraphService.singleton.onNavigationChange(this.boundUpdate);
    }

    updateMenu() {
        const incomingMenu = this.container.querySelector('#nav-incoming');
        const outgoingMenu = this.container.querySelector('#nav-outgoing');
        const title = this.container.querySelector('#nav-title');
        const navigation = this.updater();

        const nodeName = navigation.selected?.label || navigation.selected?.id || 'Navigation';

        title.textContent = `${nodeName}`;

        incomingMenu.innerHTML = '';
        outgoingMenu.innerHTML = '';

        navigation.incoming.forEach(item => {
            const menuItem = document.createElement('sl-menu-item');
            menuItem.value = item;
            menuItem.textContent = item;
            menuItem.addEventListener('click', () => this.onClick(item));
            incomingMenu.appendChild(menuItem);
        });

        navigation.outgoing.forEach(item => {
            const menuItem = document.createElement('sl-menu-item');
            menuItem.value = item;
            menuItem.textContent = item.split('.').slice(-2).join('.');
            menuItem.addEventListener('click', () => this.onClick(item));
            outgoingMenu.appendChild(menuItem);
        });
    }
}
