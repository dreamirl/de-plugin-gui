import DE from '@dreamirl/dreamengine';
import Button from './Button';

/**
 * @author Inateno / http://inateno.com / http://dreamirl.com
 */

/**
 * @constructor ShopItem
 * @augments DE.GameObject
 */
export default class ShopItem extends DE.GameObject {
  constructor(objectParams, customParams) {
    const productID = customParams.productID || customParams.id;

    super(
      Object.assign(objectParams, {
        alpha: 0.9,
        renderers: [new DE.SpriteRenderer(customParams.frame)],
        cursor: 'pointer',
        interactive: true,
        pointerover: function() {
          if (this.locked) {
            return;
          }
          this.alpha = 1;
        },
        pointerout: function() {
          this.alpha = 0.9;
        },
        // clic on the frame = route to product's page
        // custom implementation required
        pointerup: function(e) {
          if (this.locked) {
            return;
          }
          DE.Platform.pushAnalytic('shop-item-click', { productID });
          DE.trigger('shop-item-click', productID);
          this.onFrameClick();
        },
      }),
    );

    this.itemImage = new DE.GameObject({
      zindex: 0,
      renderer: new DE.SpriteRenderer(customParams.image),
    });

    // title
    customParams.title.textStyle = Object.assign(
      {
        fill: 'white',
        fontSize: 32,
        fontFamily: 'Snippet, Monaco, monospace',
        strokeThickness: 1,
        align: 'center',
      },
      customParams.title.textStyle || {},
    );

    this.title = new DE.GameObject({
      zindex: 10,
      x: customParams.title.x,
      y: customParams.title.y,
      renderer: new DE.TextRenderer(
        '',
        Object.assign(
          customParams.title,
          // force reset x/y avoiding because it is consumed in GO declaration
          { x: 0, y: 0 },
        ),
      ),
    });

    /**
     * one buy button = one currency, make it easy
     */
    const isPlatformPurchase = DE.Platform.shop.isPlatformPurchase(
      customParams,
    );
    this.button = new Button(
      {
        zindex: 1,
        x: customParams.button.x,
        y: customParams.button.y,
      },
      {
        spriteRenderer: customParams.button.renderer,
        textRenderer: customParams.button.text,
        text: customParams.button.value,
        collider: {
          width: customParams.button.width,
          height: customParams.button.height,
        },
        direction: 'horizontal',
        icon: customParams.button.icon,
      },
      {
        onMouseClick: () => this.onBuy(productID, isPlatformPurchase),
      },
    );

    this.add(this.title, this.button, this.itemImage);

    if (customParams.modifierWhenOwned && customParams.owned) {
      this.lock();
      this.button.lock();
      customParams.modifierWhenOwned.call(this);
    } else if (
      customParams.modifierWhenCurrencyLow &&
      customParams.userCurrency < customParams.price
    ) {
      this.button.lock();
      customParams.modifierWhenCurrencyLow.call(this);
    }
  }

  lock(value) {
    this.locked = value === false ? false : true;
    this.onLock();
  }

  onLock() {}

  onFrameClick() {
    // console.log('empty onFrameClick function');
  }

  onBuy(productID, isPlatformPurchase) {
    // "real" money purchase isn't the same behavior and process
    // than items bought with ingame currency
    if (isPlatformPurchase) {
      DE.Platform.shop
        .purchase(productID)
        .then((purchase) => {
          DE.Platform.pushAnalytic('shop-item-store-purchase-complete', {
            productID,
          });
          DE.trigger('shop-item-store-purchase-complete', purchase, productID);
        })
        .catch((e) => {
          DE.Platform.pushAnalytic('shop-item-store-purchase-fail', {
            productID,
            error: e,
          });
          DE.trigger('shop-item-store-purchase-fail', e, productID);
        });
    } else {
      DE.Platform.pushAnalytic('shop-item-currency-purchase', {
        productID,
      });
      DE.trigger('shop-item-currency-purchase', productID);
    }
  }
}
