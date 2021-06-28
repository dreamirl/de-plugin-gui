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

    this.currentTab = this.tabs[0];
    this.currentTabIndex = 0;
  }

  navigateTo(index, noSound) {
    this.tabs[index].lock(false);
    if (noSound) this.tabs[index].customonMouseClick();
    else this.tabs[index].onMouseClick();
  }

  reload() {
    this.tabs[this.currentTabIndex].customonMouseClick();
  }

  setActiveTab(index) {
    const target = this.tabs[index];
    if (!target)
      return console.error('Tab number', index, 'do not exist in', this.tabs);

    this.tabs.forEach((tab) => {
      tab.renderer.currentLine = 0;
    });

    this.currentTabIndex = index;
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

  createTab(tabArgs, i, buttonParams) {
    const self = this;
    const xPos =
      this.direction === 'horizontal'
        ? (buttonParams.width + (buttonParams.padding || 0)) * i
        : 0;
    const yPos =
      this.direction === 'vertical'
        ? (buttonParams.height + (buttonParams.padding || 0)) * i
        : 0;
    const button = new Button(
      Object.assign(
        {
          name: tabArgs.name,
          x: xPos,
          y: yPos,
          id: 'tab-' + i,
        },
        buttonParams.objectParams || {},
      ),
      Object.assign(tabArgs.buttonParams, buttonParams.buttonParams || {}),
      Object.assign(
        {
          onMouseClick: function() {
            if (self.container) self.container.deleteAll();
            self.currentTab.lock(false);
            self.currentTab.onMouseLeave();
            self.setActiveTab(i);
            self.currentTab.onMouseUp();
            self.currentTab.lock(true);
            tabArgs.onMouseClick();
          },
          onMouseEnter: () => {
            if (tabArgs.onMouseEnter) tabArgs.onMouseEnter();
          },
          onMouseLeave: () => {
            if (tabArgs.onMouseLeave) tabArgs.onMouseLeave();
          },
        },
        buttonParams.events || {},
      ),
    );
    return button;
  }
}
