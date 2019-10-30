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
    this.bgLayer = new DE.GameObject({
      alpha: 0.7,
      cursor: 'pointer',
      interactive: true,
      hitarea: new DE.PIXI.Rectangle(0, 0, params.width * 2, params.height * 2),
      renderer: new DE.RectRenderer(
        params.width * 2,
        params.height * 2,
        '0x010101',
        {
          fill: true,
          x: -params.width,
          y: -params.height,
        },
      ),
      pointerup: (e) => {
        if (params.closeOnLayerClick !== false) {
          this.hide();
        }
        // prevent click propagating in the scene behind
        e.stopPropagation();
      },
      zindex: 0,
    });
    this.add(this.bgLayer);
  }

  // background frame
  this.add(
    new DE.GameObject({
      opacity: 0.9,
      interactive: true,
      hitarea: new DE.PIXI.Rectangle(0, 0, params.width * 2, params.height * 2),
      renderers: [
        new DE.RectRenderer(params.width, params.height, '0x434343', {
          lineStyle: [4, '0xF033F0', 1],
          fill: true,
          x: -params.width / 2,
          y: -params.height / 2,
        }),
      ],
      pointerup: (e) => {
        // prevent click propagating behind the frame
        e.stopPropagation();
      },
    }),
  );

  this.header = new DE.GameObject({
    x: -params.width / 2,
    y: -params.height / 2 + 40,
    zindex: 2,
  });
  this.content = new DE.GameObject({
    x: -params.width / 2,
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
      collider: Object.assign({ width: 100, height: 100 }, params.button),
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
