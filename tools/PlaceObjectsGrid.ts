import PlaceObject from './PlaceObject';
import * as DE from '@dreamirl/dreamengine';

type GridParams = {
  addOrderX: 'right' | 'left';
  addOrderY: 'bottom' | 'top';
  spacingX: number;
  spacingY: number;
  maxWidth: number;
  maxHeight: number;
  prioOrder: 'horizontal' | 'vertical';
  marginX: number;
  marginY: number;
  offsetX: number;
  offsetY: number;
  parent: DE.GameObject;
};

function nextX(x: number, width: number, gridParams: GridParams) {
  if (gridParams.addOrderX == 'right') {
    x += width + gridParams.spacingX;
  } else {
    x -= width + gridParams.spacingX;
  }

  return x;
}

function nextY(y: number, height: number, gridParams: GridParams) {
  if (gridParams.addOrderY == 'bottom') {
    y += height + gridParams.spacingY;
  } else {
    y -= height + gridParams.spacingY;
  }

  return y;
}

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

export default function (
  objects: DE.GameObject[],
  params: Partial<GridParams>,
) {
  const gridParams: GridParams = Object.assign(
    {
      //grid
      maxWidth: 0,
      maxHeight: 0,
      prioOrder: 'horizontal',
      addOrderX: 'right',
      addOrderY: 'bottom',
      spacingX: 0,
      spacingY: 0,
      //objects
      marginX: 0,
      marginY: 0,
      offsetX: 0,
      offsetY: 0,
    },
    params,
  );

  setParams(gridParams, params, 'margin');
  setParams(gridParams, params, 'offset');
  setParams(gridParams, params, 'spacing');

  let x = 0;
  let y = 0;

  let maxObjectWidth = 0;
  let maxObjectHeight = 0;

  objects.forEach((object) => {
    const objectWidth = object.fixedWidth || object.width;
    const objectHeight = object.fixedHeight || object.height;

    if (gridParams.prioOrder == 'horizontal' && gridParams.maxWidth) {
      if (
        gridParams.addOrderX == 'right' &&
        x + objectWidth > gridParams.maxWidth - gridParams.marginX * 2
      ) {
        x = 0;
        y = nextY(y, maxObjectHeight, gridParams);
        maxObjectHeight = 0;
      } else if (
        gridParams.addOrderX == 'left' &&
        x - objectWidth < gridParams.marginX * 2
      ) {
        x = gridParams.maxWidth;
        y = nextY(y, maxObjectHeight, gridParams);
        maxObjectHeight = 0;
      }
    } else if (gridParams.prioOrder == 'vertical' && gridParams.maxHeight) {
      if (
        gridParams.addOrderY == 'bottom' &&
        y + objectHeight > gridParams.maxHeight - gridParams.marginY * 2
      ) {
        x = nextX(x, maxObjectWidth, gridParams);
        maxObjectWidth = 0;
        y = 0;
      } else if (
        gridParams.addOrderY == 'top' &&
        y - objectHeight < gridParams.marginY * 2
      ) {
        x = nextX(x, maxObjectWidth, gridParams);
        maxObjectWidth = 0;
        y = gridParams.maxHeight;
      }
    }

    PlaceObject(
      object,
      {
        parent: gridParams.parent,
        alignX: gridParams.addOrderX == 'right' ? 'left' : 'right',
        alignY: gridParams.addOrderY == 'bottom' ? 'top' : 'bottom',
        marginX: gridParams.marginX,
        marginY: gridParams.marginY,
        offsetX: gridParams.offsetX + x,
        offsetY: gridParams.offsetY + y,
      },
      true,
    );

    if (gridParams.prioOrder == 'horizontal') {
      x = nextX(x, objectWidth, gridParams);
    } else {
      y = nextY(y, objectHeight, gridParams);
    }

    maxObjectWidth = Math.max(maxObjectWidth, objectWidth);
    maxObjectHeight = Math.max(maxObjectHeight, objectHeight);
  });

  if (gridParams.parent) {
    objects.forEach((object) => {
      gridParams.parent.add(object);
    });
  }
}
