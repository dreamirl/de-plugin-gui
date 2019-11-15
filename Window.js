import DE from '@dreamirl/dreamengine';
import Button from './Button';
import ScrollContainer from './ScrollContainer';

/**
 * @author Inateno / http://inateno.com / http://dreamirl.com
 */

/**
 * @constructor Window
 * @augments DE.GameObject
 */
export default class Window extends DE.GameObject {
  constructor(params) {
    const width = params.width;
    const height = params.height;
    delete params.width;
    delete params.height;
    super(
      Object.assign(
        {
          zindex: 1000,
          enable: false,
        },
        params,
      ),
    );

    var self = this;

    if (!params.content) {
      params.content = {};
    }
    if (params.closeOnLayerClick !== false) {
      params.closeOnLayerClick = true;
    }
    if (params.useBackgroundLayer !== false) {
      params.useBackgroundLayer = true;
    }

    // background layer that close window on click
    if (params.useBackgroundLayer) {
      params.layer = Object.assign(
        {
          width: width * 2,
          height: height * 2,
          alpha: 0.7,
          color: '0x010101',
        },
        params.layer,
      );

      if (!params.layer.renderer) {
        params.layer.renderer = new DE.RectRenderer(
          params.layer.width,
          params.layer.height,
          params.layer.color,
          {
            fill: true,
            x: -params.layer.width / 2,
            y: -params.layer.height / 2,
          },
        );
      }
      this.bgLayer = new DE.GameObject(
        Object.assign(
          {
            zindex: 0,
            cursor: 'pointer',
            interactive: true,
            hitarea: new DE.PIXI.Rectangle(
              0,
              0,
              params.layer.width,
              params.layer.height,
            ),
            renderer: params.layer.renderer,
            pointerup: (e) => {
              if (params.closeOnLayerClick !== false) {
                this.hide();
              }
              // prevent click propagating in the scene behind
              e.stopPropagation();
            },
          },
          params.layer,
        ),
      );
      this.add(this.bgLayer);
    }

    // background frame
    if (!params.frame) {
      params.frame = {
        method: 'color',
        color: '0x434343',
        lineStyle: [4, '0xF033F0', 1],
      };
    }
    var frameRenderer;
    let method = params.frame.method;
    delete params.frame.method;
    switch (method) {
      case '9slice':
        frameRenderer = new DE.NineSliceRenderer(
          {
            textureName: params.frame.spriteName || params.frame.textureName,
            x: -width / 2,
            y: -height / 2,
            width: width,
            height: height,
          },
          params.frame.left,
          params.frame.top,
          params.frame.right,
          params.frame.bottom,
        );
        break;

      case 'sprite':
        frameRenderer = new DE.SpriteRenderer(params.frame);
        break;

      default:
        frameRenderer = new DE.RectRenderer(width, height, params.frame.color, {
          lineStyle: params.frame.lineStyle,
          fill: true,
          x: -width / 2,
          y: -height / 2,
        });
    }
    this.add(
      new DE.GameObject({
        interactive: true,
        hitarea: new DE.PIXI.Rectangle(0, 0, width, height),
        renderer: frameRenderer,
        pointerup: (e) => {
          // prevent click propagating behind the frame
          e.stopPropagation();
        },
      }),
    );

    params.header = Object.assign({}, params.header);
    this.header = new DE.GameObject({
      x: -width / 2 + (params.header.x || 0),
      y: -height / 2 + (params.header.y || 0),
      zindex: 2,
    });

    params.content = Object.assign({}, params.content);
    this.content = new DE.GameObject({
      x: -width / 2 + (params.content.x || 0),
      y: -height / 2 + (params.content.y || 0),
      zindex: 1,
    });
    this.content.contentWidth =
      params.content.width || width - params.content.x;

    this.add(this.header, this.content);

    if (params.content.type == 'scroll') {
      this.scrollContent = new ScrollContainer(
        {
          x: -width / 2 + (params.content.x || 0),
          y: -height / 2 + (params.content.y || 0),
          zindex: 1,
        },
        {
          width: params.content.width || width - params.content.x,
          height: params.content.height || height - params.content.y,
          scrollX: params.content.scrollX,
          scrollY: params.content.scrollY,
        },
        this.content,
      );
      this.scrollContent.contentWidth =
        params.content.width || width - params.content.x;
      this.add(this.scrollContent);
    }

    if (!params.noCloseBtn) {
      if (!params.button) {
        params.button = {};
      } else {
        params.button.offsetX = params.button.x;
        params.button.offsetY = params.button.y;
        delete params.button.x;
        delete params.button.y;
      }
      this.closeButton = new Button(
        {
          x: width / 2 + (params.button.offsetX || 0),
          y: -height / 2 + (params.button.offsetY || 0),
          zindex: 50,
        },
        {
          spriteRenderer: Object.assign(
            { spriteName: 'close-button' },
            params.button,
          ),
          collider: Object.assign({ width: 50, height: 50 }, params.button),
          direction: params.button.direction || 'horizontal',
        },
        {
          onMouseClick: function() {
            self.hide();
          },
        },
      );
      this.add(this.closeButton);
    }
  }

  hide() {
    this.trigger('hide');
    this.trigger('visibility-changed', false);
    this.onHide();
  }

  onHide() {
    console.log('hide');
    this.fadeOut(500, true);
  }

  show() {
    this.trigger('show');
    this.trigger('visibility-changed', true);
    this.onShow();
  }

  onShow() {
    this.fadeIn(500, true);
  }

  toggle(value) {
    if (!!value || this.enable === false) {
      this.show();
    } else {
      this.hide();
    }
  }
}
