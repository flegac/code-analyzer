import {BaseComponent} from "/component/base.component.js";
import {GraphService} from "/service/graph.service.js"
import {CameraService} from "/service/camera.service.js"

const STYLE = `
.graph-navigation {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  width: 300px;
  height: auto;
  max-height: calc(100% - 2cm);
  
  transform: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  z-index: 1000;
  padding: 0.5rem;
  box-shadow: var(--sl-shadow-large);
  border-radius: var(--sl-border-radius-medium);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
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
            const node = GraphService.singleton.nodeById[id];
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
