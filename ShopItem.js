import DE from '@dreamirl/dreamengine';
import Button from './Button';

function ShopItem(objectParams, customParams) {

  DE.GameObject.call( this, Object.assign( objectParams, {
    alpha: 0.8,
    renderers: [
      new DE.SpriteRenderer( customParams.frame ),
    ],
    cursor: "pointer",
    interactive: true,
    pointerover: function() {
      console.log("opacity ?")
      this.alpha = 1;
    },
    pointerout: function() {
      this.alpha = 0.8;      
    }
    // TODO: clic on the frame = route to product's page
  }));

  const productID = customParams.productID;
  // todo add || otherThing used by other platforms to detect a "real" purchase from a fictive one
  const isPlatformPurchase = DE.Platform.shop.isPlatformPurchase(customParams);

  this.itemImage = new DE.GameObject({
    zindex: 0,
    renderer: new DE.SpriteRenderer(customParams.image)
  });

  // title
  customParams.title.textStyle = Object.assign({
      fill: 'white',
      fontSize: 32,
      fontFamily: 'Snippet, Monaco, monospace',
      strokeThickness: 1,
      align: 'center',
  }, customParams.title.textStyle || {});

  this.title = new DE.GameObject({
    zindex: 10,
    x: customParams.title.x,
    y: customParams.title.y,
    renderer: new DE.TextRenderer('', Object.assign(customParams.title,
      // force reset x/y avoiding because it is consumed in GO declaration
      {x: 0, y: 0})),
  });

  /**
   * one button = one currency, make it easy
   */
  this.buyButton = new Button( {
    zindex: 1,
    x: customParams.button.x,
    y: customParams.button.y
  }, {
    spriteRenderer: customParams.button.renderer,
    textRenderer: customParams.button.text,
    text: customParams.button.value,
    collider: { 'width': customParams.button.width, 'height': customParams.button.height },
    'direction': 'horizontal',
  }, {
    onMouseUp: function()
    {
      console.log("shop item mouse up", isPlatformPurchase);
      if (isPlatformPurchase) {
        DE.Platform.shop.purchase(productID).then((d) => {
          // consume ? . then => give stuff
          console.log('purchase complete', d);
          // trigger('shop-purchase', productID);
        })
        .catch(e => {
          console.error('purchase failed', e);
        });
      } else {
        // make a global listener to intercept purchase made with in game currency
        DE.trigger('shop-currency-purchase', productID);
      }
    }
  } );

  if (customParams.button.icon) {
    var icon = new DE.SpriteRenderer(customParams.button.icon);
    this.buyButton.addRenderer(icon);
    let textWidth = DE.PIXI.TextMetrics.measureText(customParams.button.value, this.buyButton.renderers[1].style).width;
    icon.x = textWidth / 2 + (icon.margin || icon.width / 2) >> 0;
  }

  this.add(this.title, this.buyButton, this.itemImage);
}

ShopItem.prototype = new DE.GameObject();
ShopItem.prototype.constructor = ShopItem;
ShopItem.prototype.supr        = DE.GameObject.prototype;

export default ShopItem;
