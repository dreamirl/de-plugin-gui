import DE from '@dreamirl/dreamengine';
import Button from './Button';

/**
 * @author Inateno / http://inateno.com / http://dreamirl.com
 */

/**
 * @constructor ShopItem
 * @augments DE.GameObject
 */
/**
 * @example
* const tabs = new TabNavigation(
  {
    x: 180,
    y: 200,
    zindex: 50,
    direction: 'vertical',
    container: containerGameObject // This is used to auto delete childrens on tab click
  },
  [
    {
      onMouseClick: function() { console.log('Clicked on Tab 1') }
      buttonParams: {},
    },
    {
      onMouseClick: function() { console.log('Clicked on Tab 2') }
      buttonParams: {},
    }
  ],
  {
    width: 50,
    height: 100,
    padding: 7,
    objectParams: {},
    buttonParams: {},
    events: {},
  }
  );
*/
export default class TabNavigation extends DE.GameObject {
  constructor(objectParams, tabs, buttonParams) {
    super(objectParams);

    this.direction = objectParams.direction || 'horizontal';

    this.tabsByName = {};
    this.tabs = [];

    if (!tabs) return;
    tabs.forEach((tabArgs, i) => {
      let tab = this.createTab(tabArgs, i, buttonParams);
      this.tabsByName[tab.name] = tab;
      this.tabs.push(tab);
    });

    this.add(this.tabs);
  }

  navigateTo(target) {
    this.setActiveTab(target);
    this.currentTab.onMouseUp();
    this.currentTab.onMouseClick();

    // TODO onMouseLeave if not currentButton after onMouseClick anim
    setTimeout(() => this.currentTab.onMouseLeave(), 100);
  }

  setActiveTab(target) {
    this.tabs.forEach((tab) => {
      tab.renderer.currentLine = 0;
    });

    if (target.__proto__ && target.__proto__.DEName) {
      target.renderer.currentLine = 1;
      this.currentTab = target;
    } else {
      if (!this.tabsByName[target]) {
        console.error(
          'Tabs.navigateTo cannot find tabs named',
          target,
          'tabs by name:',
          this.tabsByName,
        );
        return;
      }
      this.tabsByName[target].renderer.currentLine = 1;
      this.currentTab = this.tabsByName[target];
    }
  }

  getCurrentTab() {
    return this.currentTab || this.tabs[0];
  }

  createTab(tabArgs, i, buttonParams) {
    var self = this;
    var xPos =
      this.direction === 'horizontal'
        ? (buttonParams.width + (buttonParams.padding || 0)) * i
        : 0;
    var yPos =
      this.direction === 'vertical'
        ? (buttonParams.height + (buttonParams.padding || 0)) * i
        : 0;
    return new Button(
      Object.assign(
        {
          name: tabArgs.name,
          x: xPos,
          y: yPos,
        },
        buttonParams.objectParams || {},
      ),
      Object.assign(tabArgs.buttonParams, buttonParams.buttonParams || {}),
      Object.assign(
        {
          onMouseClick: function() {
            if (this.container) this.container.deleteAll();
            tabArgs.onMouseClick();
            self.setActiveTab(this);
          },
        },
        buttonParams.events || {},
      ),
    );
  }
}
