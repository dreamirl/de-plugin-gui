import DE from '@dreamirl/dreamengine';
import Button from './Button';

function ShopItem(objectParams, customParams) {
  const productID = customParams.productID;

  DE.GameObject.call(
    this,
    Object.assign(objectParams, {
      alpha: 0.8,
      renderers: [new DE.SpriteRenderer(customParams.frame)],
      cursor: 'pointer',
      interactive: true,
      pointerover: function() {
        this.alpha = 1;
      },
      pointerout: function() {
        this.alpha = 0.8;
      },
      // clic on the frame = route to product's page
      // custom implementation required
      pointerup: function(e) {
        DE.Platform.pushAnalytic('shop-item-click', { productID });
        DE.trigger('shop-item-click', productID);
        this.onFrameClick();
        e.stopPropagation();
      },
    }),
  );

  const self = this;

  // todo add || otherThing used by other platforms to detect a "real" purchase from a fictive one
  const isPlatformPurchase = DE.Platform.shop.isPlatformPurchase(customParams);

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
  this.buyButton = new Button(
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
    },
    {
      onMouseClick: function() {
        // "real" money purchase isn't the same behavior and process
        // than items bought with ingame currency
        if (isPlatformPurchase) {
          DE.Platform.shop
            .purchase(productID)
            .then((d) => {
              DE.Platform.pushAnalytic('shop-item-store-purchase-complete', { productID });
              DE.trigger('shop-item-store-purchase-complete', productID);
              self.onBuy(productID);
            })
            .catch((e) => {
              DE.Platform.pushAnalytic('shop-item-store-purchase-fail', {
                productID,
                error: e
              });
              DE.trigger('shop-item-store-purchase-fail', e, productID);
              console.error('purchase failed', e);
            });
        } else {
          DE.Platform.pushAnalytic('shop-item-currency-purchase', { productID });
          DE.trigger('shop-item-currency-purchase', productID);
          self.onBuy(productID);
        }
      },
    },
  );

  if (customParams.button.icon) {
    var icon = new DE.SpriteRenderer(customParams.button.icon);
    this.buyButton.addRenderer(icon);
    let textWidth = DE.PIXI.TextMetrics.measureText(
      customParams.button.value,
      this.buyButton.renderers[1].style,
    ).width;
    icon.x = (textWidth / 2 + (icon.margin || icon.width / 2)) >> 0;
  }

  this.add(this.title, this.buyButton, this.itemImage);
}

ShopItem.prototype = new DE.GameObject();
ShopItem.prototype.constructor = ShopItem;
ShopItem.prototype.supr = DE.GameObject.prototype;

ShopItem.prototype.onFrameClick = function() {
  // console.log('empty onFrameClick function');
};
ShopItem.prototype.onBuy = function() {
  // console.log('empty onBuy function');
};

export default ShopItem;
