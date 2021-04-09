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

    this.mouseScrollSpeed = scrollContainerParams.mouseScrollSpeed || 0.6;
    this.hitArea = new DE.PIXI.Rectangle(
      0,
      0,
      scrollContainerParams.width || 300,
      scrollContainerParams.height || 300,
    );
    this.scrollX = scrollContainerParams.scrollX;
    this.scrollY = scrollContainerParams.scrollY;

    this.contentWidth = scrollContainerParams.contentWidth;
    this.contentHeight = scrollContainerParams.contentHeight;
    this.scrollSpacing = scrollContainerParams.scrollSpacing || 0;

    this.sceneScale = scrollContainerParams.sceneScale || 1;

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

    if (scrollContainerParams.scrollBar) {
      const self = this;
      this.updateViewLimit();

      if (this.scrollY) {
        this.verticalBarBtn = new Button(
          { x: 2 },
          {
            background: {
              spriteName: scrollContainerParams.scrollBar.barSprite,
            },
          },
          {},
        );

        this.verticalScrollBar = new DE.GameObject({
          x: this.hitArea.width + (scrollContainerParams.scrollBar.margin || 2),
          renderers: [
            new DE.NineSliceRenderer(
              {
                spriteName: scrollContainerParams.scrollBar.containerSprite,
                height: this.hitArea.height,
                width: 4,
                preventCenter: true,
              },
              2, //left
              2, //top
              2, //right
              2, //bottom
            ),
          ],
          updateScrollBar: function() {
            self.verticalBarBtn.y =
              (-(self.targetContainer.y - self.scrollSpacing) *
                self.hitArea.height) /
                (self.viewLimit.height + self.scrollSpacing) || 0;
          },
          automatisms: [['updateScrollBar', 'updateScrollBar']],
        });

        this.verticalScrollBar.add(this.verticalBarBtn);
        this.add(this.verticalScrollBar);
      }
      if (this.scrollX) {
        this.horizontalBarBtn = new Button(
          { y: 2, rotation: Math.PI / 2 },
          {
            background: {
              spriteName: scrollContainerParams.scrollBar.barSprite,
            },
          },
          {},
        );

        this.horizontalScrollBar = new DE.GameObject({
          y:
            this.hitArea.height + (scrollContainerParams.scrollBar.margin || 2),
          renderers: [
            new DE.NineSliceRenderer(
              {
                spriteName: scrollContainerParams.scrollBar.containerSprite,
                width: this.hitArea.width,
                height: 4,
                preventCenter: true,
              },
              2, //left
              2, //top
              2, //right
              2, //bottom
            ),
          ],
          updateScrollBar: function() {
            self.horizontalBarBtn.x =
              (-(self.targetContainer.x - self.scrollSpacing) *
                self.hitArea.width) /
                (self.viewLimit.width + self.scrollSpacing) || 0;
          },
          automatisms: [['updateScrollBar', 'updateScrollBar']],
        });

        this.horizontalScrollBar.add(this.horizontalBarBtn);
        this.add(this.horizontalScrollBar);
      }
    }

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
        this.scroll(
          this.lastDist.x / this.sceneScale,
          this.lastDist.y / this.sceneScale,
        );
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

    this.pointerover = (event) => {
      this.pointerInside = true;
    };

    this.pointerout = (event) => {
      this.pointerInside = false;
    };

    this.cleanTouch = (event) => {
      if (
        !this.locked &&
        this.touchContainer.interactive &&
        this.lastDist &&
        new Date() - this.lastMoveTime < 20
      ) {
        this.inertia = Object.assign({}, this.lastDist);

        if (
          this.targetContainer.x > this.scrollSpacing ||
          this.targetContainer.x <
            this.viewLimit.width - this.contentBounds.width - 10
        ) {
          this.inertia.x = 0;
        }
        if (
          this.targetContainer.y > this.scrollSpacing ||
          this.targetContainer.y <
            this.viewLimit.height - this.contentBounds.height - 10
        ) {
          this.inertia.y = 0;
        }
      }
      this.touchContainer.interactive = false;
      this.startPoint = undefined;
      this.lastPoint = undefined;
      this.lastDist = undefined;
      this.startDist = undefined;
    };

    this.onscroll = function(event) {
      if (!this.locked && this.pointerInside) {
        this.scroll(0, this.mouseScrollSpeed * -event.deltaY);
      }
    };
    if (!scrollContainerParams.preventWheel)
      window.addEventListener('wheel', (ev) => this.onscroll(ev));

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
  if (this.scrollX && x) this.targetContainer.x += x;
  if (this.scrollY && y) this.targetContainer.y += y;

  this.limitScroll();
};

ScrollContainer.prototype.scrollTo = function(x, y) {
  if (this.scrollX && x !== undefined) this.targetContainer.x = x;
  if (this.scrollY && y !== undefined) this.targetContainer.y = y;

  this.limitScroll();
};

ScrollContainer.prototype.updateViewLimit = function() {
  this.contentBounds = this.targetContainer.getBounds();
  this.viewLimit = {
    width: this.contentWidth
      ? this.contentWidth - this.hitArea.width + this.scrollSpacing
      : Math.min(
          this.contentBounds.width - this.hitArea.width,
          this.hitArea.width,
        ),
    height: this.contentHeight
      ? this.contentHeight - this.hitArea.height + this.scrollSpacing
      : Math.min(
          this.contentBounds.height - this.hitArea.height,
          this.hitArea.height,
        ),
  };

  if (this.viewLimit.width <= 0) {
    this.viewLimit.width = this.scrollSpacing;
  }
  if (this.viewLimit.height <= 0) {
    this.viewLimit.height = this.scrollSpacing;
  }
};

ScrollContainer.prototype.updateContentSize = function(newSize) {
  if (newSize.width) this.contentWidth = newSize.width;
  if (newSize.height) this.contentHeight = newSize.height;
  if (newSize.scrollSpacing) this.scrollSpacing = newSize.scrollSpacing;
};

ScrollContainer.prototype.updateScrollSpacing = function(scrollSpacing) {
  this.scrollSpacing = scrollSpacing;
};

ScrollContainer.prototype.limitScroll = function() {
  this.updateViewLimit();

  if (this.scrollX) {
    if (this.targetContainer.x > this.scrollSpacing) {
      this.targetContainer.x = this.scrollSpacing;
    } else if (this.targetContainer.x < -this.viewLimit.width) {
      this.targetContainer.x = -this.viewLimit.width;
    }
  }
  if (this.scrollY) {
    if (this.targetContainer.y > this.scrollSpacing) {
      this.targetContainer.y = this.scrollSpacing;
    } else if (this.targetContainer.y < -this.viewLimit.height) {
      this.targetContainer.y = -this.viewLimit.height;
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
    this.updateViewLimit();

    if (
      this.targetContainer.x > this.scrollSpacing ||
      this.targetContainer.x < -this.viewLimit.width
    ) {
      this.inertia.x *= 0.75;
    }
    if (
      this.targetContainer.y > this.scrollSpacing ||
      this.targetContainer.y < -this.viewLimit.height
    ) {
      this.inertia.y *= 0.75;
    }

    this.scroll(this.inertia.x, this.inertia.y);
    this.inertia.x *= 0.95;
    this.inertia.y *= 0.95;
  }
};
