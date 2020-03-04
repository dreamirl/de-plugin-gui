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

    var spriteRd = new DE.SpriteRenderer(buttonParams.spriteRenderer);
    spriteRd.zindex = 1;
    var textRd;
    var renderers = [spriteRd];
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

    this.direction = buttonParams.direction || 'horizontal';
    this.locked = buttonParams.locked || false;
    this.spriteRenderer = spriteRd;
    this.textRenderer = textRd;

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
      var icon = new DE.SpriteRenderer(buttonParams.icon);
      icon.zindex = 3;
      this.addRenderer(icon);
      let textWidth = DE.PIXI.TextMetrics.measureText(textRd.text, textRd.style)
        .width;
      icon.x = (textWidth / 2 + (icon.margin || icon.width / 2)) >> 0;
    }
  }
}

Button.prototype.lock = function(value) {
  this.locked = value === false ? false : true;
  this.cursor = this.locked ? 'null' : 'pointer';
  this.changeState();
  this.onLock();
};
Button.prototype.onLock = function() {};

Button.prototype.defaultSound = undefined; // define this for a default sounds applied on all buttons
Button.prototype.onMouseClick = function(event) {
  if (this.locked) {
    return;
  }
  if (this.sound || Button.prototype.defaultSound)
    DE.Audio.fx.play(this.sound || Button.prototype.defaultSound);
  this.changeState(event, this.stateOnClick);
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
  this.changeState(event, this.stateOnUp);
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
  this.changeState(event, 'null');
  var e = this.customonMouseLeave(event);
  if (e) return e;
};

Button.prototype.changeState = function(event, type) {
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
  if (this.direction == 'horizontal') {
    if (this.spriteRenderer) {
      if (this.spriteRenderer.totalFrame === 1) {
        if(!this.disableAlpha) {
          this.spriteRenderer.alpha = 0.8 + 0.1 * dir;
        }
      } else {
        this.spriteRenderer.setFrame(this.spriteRenderer.startFrame + dir);
      }
    }
  } else {
    if (this.spriteRenderer) {
      if (this.spriteRenderer.totalLine === 1) {
        if(!this.disableAlpha) {
          this.spriteRenderer.alpha = 0.8 + 0.1 * dir;
        }
      } else {
        this.spriteRenderer.setLine(this.spriteRenderer.startLine + dir);
      }
    }
  }
};
