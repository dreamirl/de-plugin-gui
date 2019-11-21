import DE from '@dreamirl/dreamengine';

/**
 * @author Inateno / http://inateno.com / http://dreamirl.com
 */

/**
 * @constructor ShopItem
 * @augments DE.GameObject
 */
/**
 *
 * @example var button = new DE.Button( {
 *   'x': 250, 'y': 250, 'zindex': 10
 * }, {
 *   spriteRenderer: { 'spriteName': 'btn', 'startFrame': 0, 'startLine': 0 }
 *   ,textRenderer: {
 *      'color': 'white', 'fontSize': 28
 *     ,'textWidth': 500, 'textHeight': 70, 'text': "ClickMe"
 *    }
 *   ,text: "hello" // can be a key for Localization
 *   , collider: { 'width': 530, 'height': 100 }
 *   ,'direction': 'horizontal'
 * }, {
 *   onMouseClick: function()
 *   {
 *     console.log( "You clicked me wow" );
 *   }
 * } );
 */
export default class ScrollContainer extends DE.GameObject {
  constructor(objectParams, scrollContainerParams, targetContainer, events) {
    super(
      Object.assign(objectParams, {
        interactive: true,
        automatisms: [['updateInertia', 'updateInertia']],
      }),
    );

    if (!scrollContainerParams) scrollContainerParams = {};

    this.hitArea = new DE.PIXI.Rectangle(
      0,
      0,
      scrollContainerParams.width || 300,
      scrollContainerParams.height || 300,
    );
    this.scrollX = scrollContainerParams.scrollX;
    this.scrollY = scrollContainerParams.scrollY;

    this.containerMask = new DE.GameObject({
      renderer: new DE.GraphicRenderer([
        { beginFill: '0xffffff' },
        {
          drawRect: [
            this.hitArea.x,
            this.hitArea.y,
            this.hitArea.width,
            this.hitArea.height,
          ],
        },
        { endFill: [] },
      ]),
    });

    this.setTarget(targetContainer);

    this.touchContainer = new DE.GameObject({
      zindex: 5,
      hitArea: this.hitArea,
      interactive: false,
    });

    this.add(this.touchContainer);

    this.pointerdown = (event) => {
      if (!this.locked) {
        this.inertia = { x: 0, y: 0 };
        this.startPoint = Object.assign({}, event.data.global);
        this.lastPoint = Object.assign({}, event.data.global);
        this.lastDist = { x: 0, y: 0 };
        this.startDist = { x: 0, y: 0 };
      }
    };

    this.pointermove = (event) => {
      this.lastMoveTime = new Date();
      if (!this.locked && this.lastPoint) {
        this.lastDist = {
          x: event.data.global.x - this.lastPoint.x,
          y: event.data.global.y - this.lastPoint.y,
        };
        this.lastPoint = Object.assign({}, event.data.global);
        this.scroll(this.lastDist.x, this.lastDist.y);
      }

      if (!this.locked && this.startPoint && this.lastPoint) {
        this.startDist = {
          x: this.startPoint.x - this.lastPoint.x,
          y: this.startPoint.y - this.lastPoint.y,
        };

        if (
          Math.abs(this.startDist.x) > 20 ||
          Math.abs(this.startDist.y) > 20
        ) {
          this.touchContainer.interactive = true;
        }
      }
    };

    this.cleanTouch = (event) => {
      if (
        !this.locked &&
        this.touchContainer.interactive &&
        this.lastDist &&
        new Date() - this.lastMoveTime < 20
      ) {
        this.inertia = Object.assign({}, this.lastDist);

        if(this.targetContainer.x > 0 ||
          this.targetContainer.x < this.viewLimit.width - this.contentBounds.width - 10) {
          this.inertia.x = 0;
        }
        if(this.targetContainer.y > 0 ||
          this.targetContainer.y < this.viewLimit.height - this.contentBounds.height - 10) {
          this.inertia.y = 0;    
        }
      }
      this.touchContainer.interactive = false;
      this.startPoint = undefined;
      this.lastPoint = undefined;
      this.lastDist = undefined;
      this.startDist = undefined;
    };

    this.pointerup = (event) => {
      this.cleanTouch();
    };
    this.pointerupoutside = (event) => {
      this.cleanTouch();
    };
  }
}

ScrollContainer.prototype.resetScroll = function() {
  this.targetContainer.x = 0;
  this.targetContainer.y = 0;
};

ScrollContainer.prototype.scroll = function(x, y) {
  if (this.scrollX) this.targetContainer.x += x;
  if (this.scrollY) this.targetContainer.y += y;

  this.limitScroll();
};

ScrollContainer.prototype.limitScroll = function() {
  this.contentBounds = this.targetContainer.getBounds();

  this.viewLimit = {
    width: Math.min(this.contentBounds.width, this.hitArea.width),
    height: Math.min(this.contentBounds.height, this.hitArea.height),
  };

  if (this.scrollX) {
    if (this.targetContainer.x > 0) {
      this.targetContainer.x += -this.targetContainer.x * 0.05;
    }
    else if (this.targetContainer.x < this.viewLimit.width - this.contentBounds.width - 10) {
      this.targetContainer.x += ((this.viewLimit.width - this.contentBounds.width - 10) - this.targetContainer.x) * 0.05;
    }
  }
  if (this.scrollY) {
    if (this.targetContainer.y > 0) {
      this.targetContainer.y += -this.targetContainer.y * 0.05;
    } 
    else if (this.targetContainer.y < this.viewLimit.height - this.contentBounds.height - 10) {
      this.targetContainer.y += ((this.viewLimit.height - this.contentBounds.height - 10) - this.targetContainer.y) * 0.05;
    }
  }
};

ScrollContainer.prototype.removeTarget = function() {
  this.locked = true;
  this.remove(this.containerMask);
  this.inertia = { x: 0, y: 0 };

  if (this.targetContainer) {
    this.targetContainer.mask = undefined;
    this.remove(this.targetContainer);
    return this.targetContainer;
  }
};

ScrollContainer.prototype.setTarget = function(targetContainer) {
  if (this.targetContainer) this.removeTarget();

  this.targetContainer = targetContainer;
  this.targetContainer.mask = this.containerMask.renderer;
  this.add(this.targetContainer, this.containerMask);
  this.locked = false;
  this.resetScroll();
};

ScrollContainer.prototype.updateInertia = function() {
  if (!this.locked && this.inertia && this.targetContainer) {

    this.contentBounds = this.targetContainer.getBounds();

    this.viewLimit = {
      width: Math.min(this.contentBounds.width, this.hitArea.width),
      height: Math.min(this.contentBounds.height, this.hitArea.height),
    };

    if(this.targetContainer.x > 0 ||
      this.targetContainer.x < this.viewLimit.width - this.contentBounds.width - 10) {
      this.inertia.x *= 0.75;
    }
    if(this.targetContainer.y > 0 ||
      this.targetContainer.y < this.viewLimit.height - this.contentBounds.height - 10) {
      this.inertia.y *= 0.75;    
    }

    this.scroll(this.inertia.x * 5, this.inertia.y * 5);
    this.inertia.x *= 0.95;
    this.inertia.y *= 0.95;
  }

  console.log(this.inertia);
};
