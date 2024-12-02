import * as DE from '@dreamirl/dreamengine';
import GameObject from '@dreamirl/dreamengine/src/classes/GameObject';
import DE_Audio from '@dreamirl/dreamengine/src/utils/Audio';

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
 *   'x': 250, 'y': 250, 'zIndex': 10
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

type AcceptedRd = DE.AnimatedTextureRenderer
  | DE.TextureRenderer
  | DE.SpriteRenderer
  | DE.TextRenderer;


type FnAny = (a: any) => any
type CustomBtnEvents = { [key: string]: FnAny };

const EmptyFn = function(event: any): any {};
export default class Button extends GameObject {
  static NO_SOUND = 'no_sound_dude';

  locked = false;
  direction = 'horizontal';
  textRenderer?: DE.TextRenderer;
  isAdvancedButton = false;
  advancedStates: any;
  statesRenderer: { [key: string]: AcceptedRd } = {};

  spriteRenderer?: DE.SpriteRenderer;
  textureRenderer?: DE.TextureRenderer;
  textureRendererStates: { [key: string]: string } = {};
  animatedTextureRenderer?: DE.AnimatedTextureRenderer;
  animatedTextureRendererStates: {
    [key: string]: DE.AnimatedTextureRenderer;
  } = {};
  iconRenderer?: DE.SpriteRenderer | DE.TextureRenderer;
  disableAlpha = false;

  private customonMouseClick: FnAny = EmptyFn;
  private customonMouseEnter: FnAny = EmptyFn;
  private customonMouseLeave: FnAny = EmptyFn;
  private customonMouseDown: FnAny = EmptyFn;
  private customonMouseUp: FnAny = EmptyFn;
  private customonMouseUpOutside: FnAny = EmptyFn;

  stateOnClick: string = '';
  stateOnUp: string = '';
  sound: string = '';

  constructor(objectParams: any, buttonParams: any, events: CustomBtnEvents) {
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

    var renderers: AcceptedRd[] = [];
    var spriteRd: DE.SpriteRenderer | undefined = undefined;
    var textureRd: DE.TextureRenderer | undefined = undefined;
    var animRd: DE.AnimatedTextureRenderer | undefined = undefined;
    var textRd: DE.TextRenderer | undefined = undefined;
    var advStates: { [key: string]: AcceptedRd } = {};

    if (buttonParams.background) {
      const bgParams = Object.assign(
        buttonParams.background,
        buttonParams.genericRenderersParams || {},
      );
      let bgRd;
      if (buttonParams.background.textureName) {
        bgRd = new DE.TextureRenderer(bgParams);
      } else if (buttonParams.background.spriteName) {
        bgRd = new DE.SpriteRenderer(bgParams);
      } else if (buttonParams.background.frames) {
        bgRd = new DE.AnimatedTextureRenderer(
          buttonParams.background.frames,
          buttonParams.background,
        );
      }
      if (bgRd) {
        bgRd.zIndex = -1;
        renderers.push(bgRd);
      }
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

        if (rd) {
          advStates[i] = rd;
          rd.visible = false;
          rd.zIndex = rd.zIndex === undefined ? 1 : rd.zIndex;
          renderers.push(rd);
        }
      }
    } else {
      if (buttonParams.spriteRenderer) {
        spriteRd = new DE.SpriteRenderer(
          Object.assign(
            buttonParams.spriteRenderer,
            buttonParams.genericRenderersParams || {},
          ),
        );
        spriteRd.zIndex = 1;
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
      textRd.zIndex = 2;
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
        let rd = this.statesRenderer[
          buttonParams.stateOnClick
        ] as DE.AnimatedTextureRenderer;
        rd.onAnimEnd = () => {
          rd.gotoAndPause(0);
          this.activeAdvancedState(this.stateOnUp);
        };
      }
      if (this.statesRenderer.idle) {
        this.statesRenderer.idle.visible = true;
      }
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

    this.customonMouseClick = events['onMouseClick'] ?? EmptyFn;
    this.customonMouseEnter = events['onMouseEnter'] ?? EmptyFn;
    this.customonMouseLeave = events['onMouseLeave'] ?? EmptyFn;
    this.customonMouseDown = events['onMouseDown'] ?? EmptyFn;
    this.customonMouseUp = events['onMouseUp'] ?? EmptyFn;
    this.customonMouseUpOutside = events['onMouseUpOutside'] ?? EmptyFn;

    this.stateOnClick = buttonParams.stateOnClick || 'hover';
    this.stateOnUp = buttonParams.stateOnUp || 'hover';

    this.sound = buttonParams.sound;

    /* @ts-ignore property override from pixi Container */
    this.pointertap = this.onMouseClick;
    /* @ts-ignore property override from pixi Container */
    this.pointerover = this.onMouseEnter;
    /* @ts-ignore property override from pixi Container */
    this.pointerout = this.onMouseLeave;
    /* @ts-ignore property override from pixi Container */
    this.pointerdown = this.onMouseDown;
    /* @ts-ignore property override from pixi Container */
    this.pointerup = this.onMouseUp;
    /* @ts-ignore property override from pixi Container */
    this.pointerupoutside = this.onMouseUpOutside;

    if (buttonParams.icon) {
      let icon;
      if (buttonParams.icon.spriteName) {
        icon = new DE.SpriteRenderer(buttonParams.icon);
      } else if (buttonParams.icon.textureName) {
        icon = new DE.TextureRenderer(buttonParams.icon);
      }

      if (icon) {
        icon.zIndex = 3;
        this.addRenderer(icon);
        this.iconRenderer = icon;
        
        let mg = 0;
        
        if ('margin' in icon) {
          mg = icon.margin as number;
        }
        
        if ('marginRight' in icon) {
          let mr = icon.marginRight as number;
          icon.x = (this.width / 2 - (icon.width / 2 + mr)) >> 0;
          if (textRd && textRd.x == 0) {
            textRd.anchor.x = 1;
            textRd.x =
              this.width / 2 -
              (icon.width + mr + (mg || mr));
          }
        } else if ('marginLeft' in icon) {
          let ml = icon.marginLeft as number;
          icon.x = (-this.width / 2 + (icon.width / 2 + ml)) >> 0;
          if (textRd && textRd.x == 0) {
            textRd.anchor.x = 0;
            textRd.x =
              -this.width / 2 +
              icon.width +
              ml +
              (mg || ml);
          }
        } else if (mg !== 0) {
          let textWidth = 0;
          if (textRd) {
            textWidth = DE.PIXI.TextMetrics.measureText(
              textRd.text,
              textRd.style as DE.PIXI.TextStyle,
            ).width;
          }
          icon.x = (textWidth / 2 + (mg || icon.width / 2)) >> 0;
        }
      }
    }

    if (this.isAdvancedButton) {
      this.activeAdvancedState('idle');
    }
  }

  activeAdvancedState(stateName: string) {
    if (!this.statesRenderer[stateName]) {
      return console.error(
        'The state ' + stateName + ' does not exists on the button',
        this.id || this,
      );
    }

    for (let i in this.statesRenderer) {
      this.statesRenderer[i]!.visible = false;
    }
    if ('pause' in this.statesRenderer[stateName]) {
      this.statesRenderer[stateName].pause = false;
    }

    this.statesRenderer[stateName].visible = true;

    this.onStateChanged(stateName, this.statesRenderer[stateName]);
  }
  onStateChanged(newState: string, rendererConcerned: AcceptedRd) {}

  lock(value: boolean) {
    this.locked = value === false ? false : true;
    this.cursor = this.locked ? 'null' : 'pointer';
    this.changeState(null, 'idle');

    if (this.isAdvancedButton && this.locked) {
      this.activeAdvancedState('locked');
    }
    this.onLock(value);
  }
  onLock(newState: boolean) {}

  static defaultSound: string = ''; // define this for a default sounds applied on all buttons
  onMouseClick(event: any) {
    if (this.locked) {
      return;
    }
    if (this.sound != Button.NO_SOUND && (this.sound || Button.defaultSound)) {
      DE_Audio.play(this.sound || Button.defaultSound);
    }
    this.changeState(event, this.stateOnClick);
    this.customonMouseClick(event);
    return true;
  }
  // let user choose if he want to use it
  onMouseUp(event: any) {
    if (this.locked) {
      return;
    }
    this.changeState(event, this.stateOnUp);
    this.customonMouseUp(event);
    return true;
  }

  onMouseUpOutside(event: any) {
    if (this.locked) {
      return;
    }
    this.changeState(event, 'idle');
    this.customonMouseUpOutside(event);
    return true;
  }

  onMouseDown(event: any) {
    if (this.locked) {
      return;
    }
    this.changeState(event, 'active');
    var e = this.customonMouseDown(event);
    if (e) return e;
    // killing events
    return true;
  }

  onMouseEnter(event: any) {
    if (this.locked) {
      return;
    }
    this.changeState(event, 'hover');
    var e = this.customonMouseEnter(event);
    if (e) return e;
  }

  onMouseLeave(event: any) {
    if (this.locked) {
      return;
    }
    this.changeState(event, 'idle');
    var e = this.customonMouseLeave(event);
    if (e) return e;
  }

  changeState(event: any, type: string) {
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

    if (this.textureRenderer && this.textureRendererStates[dir]) {
      this.textureRenderer.changeTexture(this.textureRendererStates[dir]!);
    }
  }
}
