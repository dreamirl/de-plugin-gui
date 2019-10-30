import DE from '@dreamirl/dreamengine';
import Button from './Button';

function Window(params) {
  DE.GameObject.call(
    this,
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
        width: params.width * 2,
        height: params.height * 2,
        alpha: 0.7,
        color: '0x010101',
      },
      params.layer,
    );
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
          renderer: new DE.RectRenderer(
            params.layer.width,
            params.layer.height,
            params.layer.color,
            {
              fill: true,
              x: -params.layer.width / 2,
              y: -params.layer.height / 2,
            },
          ),
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
          x: -params.width / 2,
          y: -params.height / 2,
          width: params.width,
          height: params.height,
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
      frameRenderer = new DE.RectRenderer(
        params.width,
        params.height,
        params.frame.color,
        {
          lineStyle: params.frame.lineStyle,
          fill: true,
          x: -params.width / 2,
          y: -params.height / 2,
        },
      );
  }
  this.add(
    new DE.GameObject({
      interactive: true,
      hitarea: new DE.PIXI.Rectangle(0, 0, params.width, params.height),
      renderer: frameRenderer,
      pointerup: (e) => {
        // prevent click propagating behind the frame
        e.stopPropagation();
      },
    }),
  );

  params.header = Object.assign({}, params.header);
  this.header = new DE.GameObject({
    x: -params.width / 2 + (params.header.x || 0),
    y: -params.height / 2 + (params.header.y || 0),
    zindex: 2,
  });

  params.content = Object.assign({}, params.content);
  this.content = new DE.GameObject({
    x: -params.width / 2 + (params.content.x || 0),
    y: -params.height / 2 + (params.content.y || 0),
    zindex: 1,
  });

  // this.closeButton = new Button();
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
      x: params.width / 2 + (params.button.offsetX || 0),
      y: -params.height / 2 + (params.button.offsetY || 0),
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

  this.add(this.header, this.content, this.closeButton);
}

Window.prototype = new DE.GameObject();
Window.prototype.constructor = Window;
Window.prototype.supr = DE.GameObject.prototype;

Window.prototype.hide = function() {
  this.trigger('hide');
  this.trigger('visibility-changed', false);
  this.onHide();
};
Window.prototype.onHide = function() {
  console.log('hide');
  this.fadeOut(500, true);
};

Window.prototype.show = function() {
  this.trigger('show');
  this.trigger('visibility-changed', true);
  this.onShow();
};
Window.prototype.onShow = function() {
  this.fadeIn(500, true);
};

Window.prototype.toggle = function(value) {
  if (!!value || this.enable === false) {
    this.show();
  } else {
    this.hide();
  }
};

export default Window;
