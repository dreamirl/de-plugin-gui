import DE from '@dreamirl/dreamengine';

/**
 * @author Thaeldaras / http://dreamirl.com
 */

function setPositionParam(positionParams, params, value) {
  if (params[value] != undefined) {
    positionParams[value] = params[value];
  }
  if (params[value + 'X'] != undefined) {
    positionParams[value + 'X'] = params[value + 'X'];
  }
  if (params[value + 'Y'] != undefined) {
    positionParams[value + 'Y'] = params[value + 'Y'];
  }
}

export default function SetObjectPosition(params, target, refX) {
  var positionParams = Object.assign(
    {
      alignX: 'center',
      alignY: 'center',
      marginX: 0,
      marginY: 0,
      spacingX: 0,
      spacingY: 0,
      offsetX: 0,
      offsetY: 0,
    },
    params,
  );

  setPositionParam(positionParams, params, 'margin');
  setPositionParam(positionParams, params, 'spacing');
  setPositionParam(positionParams, params, 'offset');

  console.log(positionParams);

  if (!target.parent && !params.parent) {
    console.error(
      'Trying to calc position for object with no parent set',
      target,
      params,
    );
    return;
  }

  var parent = params.parent ? params.parent : target.parent;

  //optimisation perf
  var targetWidth = target.width;
  var targetHeight = target.height;
  var parentWidth = parent.width;
  var parentHeight = parent.height;

  switch (positionParams.alignX) {
    case 'center':
      target.x = parentWidth / 2 + positionParams.offsetX;
      break;
    case 'left':
      target.x =
        targetWidth / 2 +
        positionParams.marginX +
        positionParams.offsetX +
        positionParams.spacingX;
      break;
    case 'right':
      target.x =
        parentWidth -
        (targetWidth / 2 +
          positionParams.marginX +
          positionParams.offsetX +
          positionParams.spacingX);
      break;
    default:
      console.error('Wrong alignX param', positionParams.alignX);
      break;
  }
  switch (positionParams.alignY) {
    case 'center':
      target.x = parentHeight / 2 + positionParams.offsetY;
      break;
    case 'top':
      target.x =
        targetHeight / 2 +
        positionParams.marginY +
        positionParams.offsetY +
        positionParams.spacingY;
      break;
    case 'bottom':
      target.x =
        parentHeight -
        (targetHeight / 2 +
          positionParams.marginY +
          positionParams.offsetY +
          positionParams.spacingY);
      break;
    default:
      console.error('Wrong alignY param', positionParams.alignY);
      break;
  }
}
