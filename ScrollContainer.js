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
  constructor(objectParams, scrollContainerParams, events) {
    super(
      Object.assign(objectParams, {
        interactive: true,
        automatisms: [['updateInertia', 'updateInertia']],
      }),
    );

    if (!scrollContainerParams) scrollContainerParams = {};

    this.mouseScrollSpeed = scrollContainerParams.mouseScrollSpeed || 0.6;
    this.scrollX = scrollContainerParams.scrollX;
    this.scrollY = scrollContainerParams.scrollY;
    this.containerSize = {
      width: scrollContainerParams.width,
      height: scrollContainerParams.height,
    };

    this.contentWidth = scrollContainerParams.contentWidth;
    this.contentHeight = scrollContainerParams.contentHeight;
    this.scrollSpacing = scrollContainerParams.scrollSpacing || 0;

    this.sceneScale = scrollContainerParams.sceneScale || 1;

    this.nineSliceMaskParams = scrollContainerParams.nineSliceMaskParams;

    if (this.nineSliceMaskParams) {
      if (!DE.MainLoop.renders[0]);
      {
        console.error("t'es mort KABOUM! hacker noob!!");
      }

      var maskTexture = DE.MainLoop.renders[0].pixiRenderer.generateTexture(
        new DE.NineSliceRenderer(
          {
            spriteName: this.nineSliceMaskParams.name,
            width: this.containerSize.width,
            height: this.containerSize.height,
            preventCenter: true,
          },
          this.nineSliceMaskParams.left,
          this.nineSliceMaskParams.top,
          this.nineSliceMaskParams.right,
          this.nineSliceMaskParams.bottom,
        ),
        DE.PIXI.SCALE_MODES.NEAREST,
        1,
        new DE.PIXI.Rectangle(0, 0, 153, 133),
      );

      this.containerMask = new DE.GameObject({
        x: this.contentWidth / 2,
        y: this.contentHeight / 2,
        renderer: new DE.TextureRenderer({ texture: maskTexture }),
      });
    } else {
      this.containerMask = new DE.GameObject({
        renderer: new DE.GraphicRenderer([
          { beginFill: '0xffffff' },
          {
            drawRect: [
              0,
              0,
              this.containerSize.width,
              this.containerSize.height,
            ],
          },
          { endFill: [] },
        ]),
      });
    }

    this.content = new DE.GameObject({
      x: 0,
      y: 0,
      zindex: 1,
    });
    this.content.contentWidth = scrollContainerParams.width;
    this.setTarget(this.content);

    this.touchContainer = new DE.GameObject({
      zindex: 5,
      hitArea: this.hitArea,
      interactive: false,
    });

    this.add(this.touchContainer);

    this.contentBounds = this.content.getBounds();

    if (scrollContainerParams.scrollBar) {
      const self = this;
      this.updateViewLimit();

      const oneScroll = this.mouseScrollSpeed * 120;
      if (this.scrollY) {
        const maxNbScrolls = (this.contentHeight || 0) / oneScroll;
        this.scrollBarSizeHeight = this.containerSize.height / maxNbScrolls;
        this.scrollBarSizeHeight = isFinite(this.scrollBarSizeHeight)
          ? this.scrollBarSizeHeight
          : 0;
        this.verticalBarBtn = new Button(
          {
            x: 2,
            renderer: new DE.NineSliceRenderer(
              {
                spriteName: scrollContainerParams.scrollBar.barSprite,
                height: this.scrollBarSizeHeight,
                width: 4,
              },
              2, //left
              2, //top
              2, //right
              2, //bottom
            ),
          },
          {},
          {
            onMouseDown: function() {
              this.parent.mouseDown = true;
            },
            onMouseUp: function() {
              setTimeout(() => (self.verticalScrollBar.mouseDown = false), 10);
            },
            onMouseUpOutside: function() {
              setTimeout(() => (self.verticalScrollBar.mouseDown = false), 10);
            },
          },
        );

        this.verticalScrollBar = new DE.GameObject({
          enable: maxNbScrolls >= 1,
          x:
            this.containerSize.width +
            (scrollContainerParams.scrollBar.margin || 2),
          renderers: [
            new DE.NineSliceRenderer(
              {
                spriteName: scrollContainerParams.scrollBar.containerSprite,
                height: this.containerSize.height,
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
              ((-(self.content.y - self.scrollSpacing) *
                (self.containerSize.height - self.scrollBarSizeHeight)) /
                (self.viewLimit.height + self.scrollSpacing) || 0) +
              self.scrollBarSizeHeight / 2;
          },
          automatisms: [['updateScrollBar', 'updateScrollBar']],
        });

        this.verticalScrollBar.add(this.verticalBarBtn);
        this.add(this.verticalScrollBar);
      }
      if (this.scrollX) {
        const maxNbScrolls = (this.contentWidth || 0) / oneScroll;
        this.scrollBarSizeWidth = this.containerSize.width / maxNbScrolls;
        this.scrollBarSizeWidth = isFinite(this.scrollBarSizeWidth)
          ? this.scrollBarSizeWidth
          : 0;

        this.horizontalBarBtn = new Button(
          {
            y: 2,
            rotation: Math.PI / 2,
            renderer: new DE.NineSliceRenderer(
              {
                spriteName: scrollContainerParams.scrollBar.barSprite,
                height: this.scrollBarSizeWidth,
                width: 4,
              },
              2, //left
              2, //top
              2, //right
              2, //bottom
            ),
          },
          {},
          {
            onMouseDown: function() {
              this.parent.mouseDown = true;
            },
            onMouseUp: function() {
              setTimeout(
                () => (self.horizontalScrollBar.mouseDown = false),
                10,
              );
            },
            onMouseUpOutside: function() {
              setTimeout(
                () => (self.horizontalScrollBar.mouseDown = false),
                10,
              );
            },
          },
        );

        this.horizontalScrollBar = new DE.GameObject({
          enable: maxNbScrolls >= 1,
          y:
            this.containerSize.height +
            (scrollContainerParams.scrollBar.margin || 2),
          renderers: [
            new DE.NineSliceRenderer(
              {
                spriteName: scrollContainerParams.scrollBar.containerSprite,
                width: this.containerSize.width,
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
              ((-(self.content.x - self.scrollSpacing) *
                (self.containerSize.width - self.scrollBarSizeWidth)) /
                (self.viewLimit.width + self.scrollSpacing) || 0) +
              self.scrollBarSizeWidth / 2;
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

        const scrollBarH =
          this.horizontalScrollBar && this.horizontalScrollBar.mouseDown;
        const scrollBarV =
          this.verticalScrollBar && this.verticalScrollBar.mouseDown;

        this.scroll(
          (scrollBarH
            ? -(this.viewLimit.width + this.scrollSpacing) /
              this.containerSize.width
            : 1) *
            (this.lastDist.x / this.sceneScale) *
            (scrollBarV ? 0 : 1),
          (scrollBarV
            ? -(this.viewLimit.height + this.scrollSpacing) /
              this.containerSize.height
            : 1) *
            (this.lastDist.y / this.sceneScale) *
            (scrollBarH ? 0 : 1),
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
        if (
          (!this.horizontalScrollBar ||
            (this.horizontalScrollBar &&
              !this.horizontalScrollBar.mouseDown)) &&
          (!this.verticalScrollBar ||
            (this.verticalScrollBar && !this.verticalScrollBar.mouseDown))
        )
          this.inertia = Object.assign({}, this.lastDist);

        if (
          this.content.x > this.scrollSpacing ||
          this.content.x <
            this.viewLimit.width - this.contentBounds.width - 10
        ) {
          this.inertia.x = 0;
        }
        if (
          this.content.y > this.scrollSpacing ||
          this.content.y <
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

ScrollContainer.prototype.DEName = 'GUI.ScrollContainer';

ScrollContainer.prototype.resetScroll = function() {
  this.content.x = 0;
  this.content.y = 0;
};

ScrollContainer.prototype.scroll = function(x, y) {
  if (this.scrollX && x) this.content.x += x;
  if (this.scrollY && y) this.content.y += y;

  this.limitScroll();
};

ScrollContainer.prototype.scrollTo = function(x, y) {
  if (this.scrollX && x !== undefined) this.content.x = x;
  if (this.scrollY && y !== undefined) this.content.y = y;

  this.limitScroll();
};

ScrollContainer.prototype.updateViewLimit = function() {
  this.viewLimit = {
    width: this.contentWidth
      ? this.contentWidth - this.containerSize.width + this.scrollSpacing
      : Math.min(
          this.contentBounds.width - this.containerSize.width,
          this.containerSize.width,
        ),
    height: this.contentHeight
      ? this.contentHeight - this.containerSize.height + this.scrollSpacing
      : Math.min(
          this.contentBounds.height - this.containerSize.height,
          this.containerSize.height,
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
  const oneScroll = this.mouseScrollSpeed * 120;
  if (newSize.width) {
    this.contentWidth = newSize.width;

    if (this.horizontalScrollBar) {
      const maxNbScrolls = this.contentWidth / oneScroll;
      this.scrollBarSizeWidth = this.containerSize.width / maxNbScrolls;
      this.scrollBarSizeWidth = isFinite(this.scrollBarSizeWidth)
        ? this.scrollBarSizeWidth
        : 0;
      this.horizontalScrollBar.enable = maxNbScrolls >= 1;
      this.horizontalBarBtn.renderer.height = this.scrollBarSizeWidth;
      this.horizontalBarBtn.renderer.center();
    }
  }
  if (newSize.height) {
    this.contentHeight = newSize.height;

    if (this.verticalScrollBar) {
      const maxNbScrolls = this.contentHeight / oneScroll;
      this.scrollBarSizeHeight = this.containerSize.height / maxNbScrolls;
      this.scrollBarSizeHeight = isFinite(this.scrollBarSizeHeight)
        ? this.scrollBarSizeHeight
        : 0;
      this.verticalScrollBar.enable = maxNbScrolls >= 1;
      this.verticalBarBtn.renderer.height = this.scrollBarSizeHeight;
      this.verticalBarBtn.renderer.center();
    }
  }
  if (newSize.scrollSpacing) this.scrollSpacing = newSize.scrollSpacing;
  this.contentBounds = this.content.getBounds();
};

ScrollContainer.prototype.updateScrollSpacing = function(scrollSpacing) {
  this.scrollSpacing = scrollSpacing;
};

ScrollContainer.prototype.limitScroll = function() {
  this.updateViewLimit();

  if (this.scrollX) {
    if (this.content.x > this.scrollSpacing) {
      this.content.x = this.scrollSpacing;
    } else if (this.content.x < -this.viewLimit.width) {
      this.content.x = -this.viewLimit.width;
    }
  }
  if (this.scrollY) {
    if (this.content.y > this.scrollSpacing) {
      this.content.y = this.scrollSpacing;
    } else if (this.content.y < -this.viewLimit.height) {
      this.content.y = -this.viewLimit.height;
    }
  }
};

ScrollContainer.prototype.removeTarget = function() {
  this.locked = true;
  this.remove(this.containerMask);
  this.inertia = { x: 0, y: 0 };

  if (this.content) {
    this.content.mask = undefined;
    this.remove(this.content);
    return this.content;
  }
};

ScrollContainer.prototype.setTarget = function(content) {
  if (this.content) this.removeTarget();

  this.content = content;
  this.content.mask = this.containerMask.renderer;
  this.add(this.content, this.containerMask);
  this.locked = false;
  this.resetScroll();
};

ScrollContainer.prototype.updateInertia = function() {
  if (!this.locked && this.inertia && this.content) {
    this.updateViewLimit();

    if (
      this.content.x > this.scrollSpacing ||
      this.content.x < -this.viewLimit.width
    ) {
      this.inertia.x *= 0.75;
    }
    if (
      this.content.y > this.scrollSpacing ||
      this.content.y < -this.viewLimit.height
    ) {
      this.inertia.y *= 0.75;
    }

    this.scroll(this.inertia.x, this.inertia.y);
    this.inertia.x *= 0.95;
    this.inertia.y *= 0.95;
  }
};
