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
 * var tabs = new TabNavigation({
  x: 180,
  y: 200,
  zindex: 50,
  items: {
    padding: 0,
    width: 120
  },
  tabs: [
    {
      name: 'tabName',
      text: 'Text or localisation key',
      onMouseClick: function() { when clicked, what to do}
    }
  ]
});
*/
export default class TabNavigation extends DE.GameObject {
  constructor(params) {
    super(params);

    this.itemWidth = params.width;
    this.startX = this.x;
    this.startY = this.y;
    this.direction = params.items.direction || 'horizontal';

    this.tabsByName = {};
    this.tabs = [];

    params.tabs.forEach((tabArgs, i) => {
      let tab = this.createTab(tabArgs, i);
      this.tabsByName[tab.name] = tab;
      this.tabs.push(tab);
    });

    this.add(this.tabs);
  }

  navigateTo(target) {
    this.setActiveTab(target);
    this.currentTab.customonMouseClick();
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

  createTab(tabArgs, i) {
    var self = this;

    var xPos =
      this.direction === 'horizontal'
        ? (this.items.width + this.items.padding) * i
        : 0;
    var yPos =
      this.direction === 'vertical'
        ? (this.items.height + this.items.padding) * i
        : 0;
    return new Button(
      {
        name: tabArgs.name,
        x: xPos,
        y: yPos,
      },
      Object.assign(cloneObj(this.tabArgs), { text: tabArgs.text }),
      {
        onMouseClick: function() {
          tabArgs.onMouseClick();
          self.setActiveTab(this);
        },
      },
    );
  }
}

var cloneObj = function(original) {
  return JSON.parse(JSON.stringify(original));
};
