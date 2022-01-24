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
export default class Button extends DE.GameObject {
  constructor(objectParams, buttonParams, events) {
    let hitarea = null;
    // todo looks like the collider (at least rectangle) isn't working
    if (!buttonParams.collider) {
      hitarea = null; // image will be used as it is
    } else if (buttonParams.collider.radius) {
      hitarea = new DE.PIXI.Circle(
        buttonParams.collider.x || 0,
        buttonParams.collider.y || 0,
        buttonParams.collider.radius,
      );
    } else if (buttonParams.collider.width) {
      hitarea = new DE.PIXI.Rectangle(
        buttonParams.collider.x || 0,
        buttonParams.collider.y || 0,
        buttonParams.collider.width,
        buttonParams.collider.height || buttonParams.collider.width,
      );
    }

    var renderers = [];
    var spriteRd;
    var textureRd;
    var animRd;
    var textRd;
    var advStates = {};

    if (buttonParams.background) {
      const bgParams = Object.assign(
        buttonParams.background,
        buttonParams.genericRenderersParams || {},
      );
      var bgRd;
      if (buttonParams.background.textureName) {
        bgRd = new DE.TextureRenderer(buttonParams.background);
      } else if (buttonParams.background.spriteName) {
        bgRd = new DE.TextureRenderer(buttonParams.background);
      } else if (buttonParams.background.frames) {
        bgRd = new DE.AnimatedTextureRenderer(
          buttonParams.background.frames,
          buttonParams.background,
        );
      }
      bgRd.zindex = -1;
      renderers.push(bgRd);
    }

    if (buttonParams.advancedStates) {
      for (var i in buttonParams.advancedStates) {
        let st = Object.assign(
          buttonParams.advancedStates[i],
          buttonParams.genericRenderersParams || {},
        );
        var rd;
        if (st.frames) {
          rd = new DE.AnimatedTextureRenderer(st.frames, st);
          rd.gotoAndPause(0);
        } else if (st.textureName) {
          rd = new DE.TextureRenderer(st);
        } else if (st.spriteName) {
          rd = new DE.SpriteRenderer(st);
        }
        advStates[i] = rd;
        rd.visible = false;
        rd.zindex = rd.zindex === undefined ? 1 : rd.zindex;
        renderers.push(rd);
      }
    } else {
      if (buttonParams.spriteRenderer) {
        spriteRd = new DE.SpriteRenderer(
          Object.assign(
            buttonParams.spriteRenderer,
            buttonParams.genericRenderersParams || {},
          ),
        );
        spriteRd.zindex = 1;
        renderers.push(spriteRd);
      }
      if (buttonParams.textureRenderer) {
        textureRd = new DE.TextureRenderer(
          Object.assign(
            buttonParams.textureRenderer,
            buttonParams.genericRenderersParams || {},
          ),
        );
        renderers.push(textureRd);
      }
      if (buttonParams.animatedTextureRenderer) {
        animRd = new DE.AnimatedTextureRenderer(
          buttonParams.animatedTextureRenderer.frames,
          Object.assign(
            buttonParams.animatedTextureRenderer,
            buttonParams.genericRenderersParams || {},
          ),
        );
        renderers.push(animRd);
      }
    }

    if (buttonParams.textRenderer || buttonParams.text) {
      textRd = new DE.TextRenderer(
        buttonParams.text,
        buttonParams.textRenderer,
      );
      textRd.zindex = 2;
      renderers.push(textRd);
    }

    super(
      Object.assign(objectParams, {
        renderers,
        cursor: 'pointer',
        interactive: true,
        hitarea,
      }),
    );

    this.locked = buttonParams.locked || false;
    this.direction = buttonParams.direction || 'horizontal';
    if (textRd) {
      this.textRenderer = textRd;
    }

    if (buttonParams.advancedStates) {
      this.isAdvancedButton = true;
      this.advancedStates = buttonParams.advancedStates;
      this.statesRenderer = advStates;

      if (
        buttonParams.stateOnClick &&
        buttonParams.advancedStates[buttonParams.stateOnClick] &&
        buttonParams.advancedStates[buttonParams.stateOnClick].frames
      ) {
        this.statesRenderer[buttonParams.stateOnClick].onAnimEnd = () => {
          this.statesRenderer[buttonParams.stateOnClick].gotoAndPause(0);
          this.activeAdvancedState(this.stateOnUp);
        };
      }
      this.statesRenderer.idle.visible = true;
    } else {
      if (spriteRd) {
        this.spriteRenderer = spriteRd;
      }
      if (textureRd) {
        this.textureRenderer = textureRd;
        this.textureRendererStates = buttonParams.textureRenderer.states;
      }
      if (animRd) {
        this.animatedTextureRenderer = animRd;
        this.animatedTextureRendererStates =
          buttonParams.animatedTextureRenderer.states;
      }
    }

    this.customonMouseClick = function() {};
    this.customonMouseEnter = function() {};
    this.customonMouseLeave = function() {};
    this.customonMouseDown = function() {};
    this.customonMouseUp = function() {};
    this.customonMouseUpOutside = function() {};
    for (var i in events) this['custom' + i] = events[i];
    this.stateOnClick = buttonParams.stateOnClick || 'hover';
    this.stateOnUp = buttonParams.stateOnUp || 'hover';

    this.sound = buttonParams.sound;

    this.pointertap = this.onMouseClick;
    this.pointerover = this.onMouseEnter;
    this.pointerout = this.onMouseLeave;
    this.pointerdown = this.onMouseDown;
    this.pointerup = this.onMouseUp;
    this.pointerupoutside = this.onMouseUpOutside;

    if (buttonParams.icon) {
      var icon;
      if (buttonParams.icon.spriteName) {
        icon = new DE.SpriteRenderer(buttonParams.icon);
      } else if (buttonParams.icon.textureName) {
        icon = new DE.TextureRenderer(buttonParams.icon);
      }
      icon.zindex = 3;
      this.addRenderer(icon);
      this.iconRenderer = icon;

      if (icon.marginRight) {
        icon.x = (this.width / 2 - (icon.width / 2 + icon.marginRight)) >> 0;
        if (textRd && textRd.x == 0) {
          textRd.anchor.x = 1;
          textRd.x =
            this.width / 2 -
            (icon.width + icon.marginRight + (icon.margin || icon.marginRight));
        }
      } else if (icon.marginLeft) {
        icon.x = (-this.width / 2 + (icon.width / 2 + icon.marginLeft)) >> 0;
        if (textRd && textRd.x == 0) {
          textRd.anchor.x = 0;
          textRd.x =
            -this.width / 2 +
            icon.width +
            icon.marginLeft +
            (icon.margin || icon.marginLeft);
        }
      } else if (icon.margin !== false) {
        if (textRd) {
          let textWidth = DE.PIXI.TextMetrics.measureText(
            textRd.text,
            textRd.style,
          ).width;
        }
        icon.x = (textWidth / 2 + (icon.margin || icon.width / 2)) >> 0;
      }
    }

    if (this.isAdvancedButton) {
      this.activeAdvancedState('idle');
    }

    this.cursor = 'hover';
  }
}

Button.prototype.activeAdvancedState = function(stateName) {
  if (!this.statesRenderer[stateName]) {
    return console.error(
      'The state ' + stateName + ' does not exists on the button',
      this.id || this,
    );
  }

  for (var i in this.statesRenderer) {
    this.statesRenderer[i].visible = false;
  }
  this.statesRenderer[stateName].pause = false;
  this.statesRenderer[stateName].visible = true;

  this.onStateChanged(stateName, this.statesRenderer[stateName]);
};
Button.prototype.onStateChanged = function() {};

Button.prototype.lock = function(value) {
  this.locked = value === false ? false : true;
  this.cursor = this.locked ? 'null' : 'pointer';
  this.changeState(null, 'idle');

  if (this.isAdvancedButton && this.locked) {
    this.activeAdvancedState('locked');
  }
  this.onLock(value);
};
Button.prototype.onLock = function() {};

Button.prototype.defaultSound = undefined; // define this for a default sounds applied on all buttons
Button.prototype.onMouseClick = function(event) {
  if (this.locked) {
    return;
  }
  if (this.sound || Button.prototype.defaultSound) {
    DE.Audio.fx.play(this.sound || Button.prototype.defaultSound);
  }
  this.changeState(event, this.stateOnClick);
  console.log('click', this);
  this.customonMouseClick(event);
  return true;
};
// let user choose if he want to use it
Button.prototype.onMouseUp = function(event) {
  if (this.locked) {
    return;
  }
  this.changeState(event, this.stateOnUp);
  this.customonMouseUp(event);
  return true;
};

Button.prototype.onMouseUpOutside = function(event) {
  if (this.locked) {
    return;
  }
  this.changeState(event, 'idle');
  this.customonMouseUpOutside(event);
  return true;
};

Button.prototype.onMouseDown = function(event) {
  if (this.locked) {
    return;
  }
  this.changeState(event, 'active');
  var e = this.customonMouseDown(event);
  if (e) return e;
  // killing events
  return true;
};

Button.prototype.onMouseEnter = function(event) {
  if (this.locked) {
    return;
  }
  this.changeState(event, 'hover');
  var e = this.customonMouseEnter(event);
  if (e) return e;
};

Button.prototype.onMouseLeave = function(event) {
  if (this.locked) {
    return;
  }
  this.changeState(event, 'idle');
  var e = this.customonMouseLeave(event);
  if (e) return e;
};

Button.prototype.changeState = function(event, type) {
  if (this.isAdvancedButton) {
    this.activeAdvancedState(type);
    return;
  }
  var dir = 0;
  switch (type) {
    case 'hover':
      dir = 1;
      break;
    case 'active':
      dir = 2;
      break;
    default:
      dir = 0;
  }
  if (this.spriteRenderer) {
    if (this.direction == 'horizontal') {
      if (this.spriteRenderer.totalFrame === 1) {
        if (!this.disableAlpha) {
          this.spriteRenderer.alpha = 0.8 + 0.1 * dir;
        }
      } else {
        this.spriteRenderer.setFrame(this.spriteRenderer.startFrame + dir);
      }
    } else {
      if (this.spriteRenderer.totalLine === 1) {
        if (!this.disableAlpha) {
          this.spriteRenderer.alpha = 0.8 + 0.1 * dir;
        }
      } else {
        this.spriteRenderer.setLine(this.spriteRenderer.startLine + dir);
      }
    }
  }

  if (this.textureRenderer) {
    this.textureRenderer.changeTexture(this.textureRendererStates[dir]);
  }
};
