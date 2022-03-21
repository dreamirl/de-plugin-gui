import DE from '@dreamirl/dreamengine';

/**
 * @author Thaeldaras / http://dreamirl.com
 * position the object toward his parent with the inputs given
 * @param {Object} positionParams the fx name to play {alignX,alignY,marginX,marginY,offsetX,offsetY}
 * @param {Object} params
 * @param {Int} value
 */

function setParams(outparams, params, value) {
  if (params[value] != undefined) {
    outparams[value] = params[value];
    outparams[value + 'X'] = params[value];
    outparams[value + 'Y'] = params[value];
  }
  if (params[value + 'X'] != undefined) {
    outparams[value + 'X'] = params[value + 'X'];
  }
  if (params[value + 'Y'] != undefined) {
    outparams[value + 'Y'] = params[value + 'Y'];
  }
}

export default function (object, params, wipePosCache) {
  let isGameObject = object instanceof DE.GameObject;

  if (!params) params = {};

  if (!object.parent && !params.parent) {
    console.error(
      'Trying to calc position for object with no parent set',
      object,
      params,
    );
    return;
  }

  var parent = params.parent || object.parent;
  var addToParent = !!params.parent;
  delete params.parent;

  var positionParams = {
    alignX: 'center',
    alignY: 'center',
    marginX: 0,
    marginY: 0,
    offsetX: 0,
    offsetY: 0,
    ...(wipePosCache ? {} : object.positionParams),
    ...params,
  };
  object.positionParams = positionParams;

  setParams(positionParams, params, 'margin');
  setParams(positionParams, params, 'offset');

  //optimisation perf
  var objectWidth = object.fixedWidth || object.width;
  var objectHeight = object.fixedHeight || object.height;
  var parentWidth = parent.fixedWidth || parent.width;
  var parentHeight = parent.fixedHeight || parent.height;

  switch (positionParams.alignX) {
    case 'center':
      object.x = parentWidth / 2 + positionParams.offsetX - objectWidth / 2;
      break;
    case 'left':
      object.x = positionParams.marginX + positionParams.offsetX;
      break;
    case 'right':
      object.x =
        parentWidth -
        (objectWidth + positionParams.marginX) +
        positionParams.offsetX;
      break;
    default:
      console.error('Wrong alignX param', positionParams.alignX);
      break;
  }
  switch (positionParams.alignY) {
    case 'center':
      object.y = parentHeight / 2 + positionParams.offsetY - objectHeight / 2;
      break;
    case 'top':
      object.y = positionParams.marginY + positionParams.offsetY;
      break;
    case 'bottom':
      object.y =
        parentHeight -
        (objectHeight + positionParams.marginY) +
        positionParams.offsetY;
      break;
    default:
      console.error('Wrong alignY param', positionParams.alignY);
      break;
  }
  if (addToParent) {
    if (isGameObject) {
      parent.add(object);
    } else {
      parent.addRenderer(object);
    }
  }
  return object;
}
