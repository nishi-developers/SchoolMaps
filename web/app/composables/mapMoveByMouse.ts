type Config = { wheel: { unit: number } };
const defaultConfig: Config = { wheel: { unit: 0.15 } };

export const useMapMoveByMouse = (
  mapMove: ReturnType<typeof useMapMove>,
  headerHeight: number,
  config: Config = defaultConfig
) => {
  const moveMouse = (event: MouseEvent) => {
    // マウスの移動による操作
    if (event.buttons === 1) {
      // 左クリックが押されている場合のみ
      mapMove.movePosition(event.movementX, event.movementY);
    } else if (event.buttons === 4) {
      // ホイールボタンが押されている場合のみ
      if (event.movementX > 0) {
        mapMove.moveRotate(Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5, {
          x: event.clientX,
          y: event.clientY - headerHeight,
        });
      } else {
        mapMove.moveRotate(-Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5, {
          x: event.clientX,
          y: event.clientY - headerHeight,
        });
      }
    }
  };
  const moveWheel = (event: WheelEvent) => {
    // マウスのホイールによる操作
    let delta = 0;
    const unit = config.wheel.unit;

    if (event.deltaY < 0) {
      delta = unit;
    } else {
      delta = -unit;
    }
    mapMove.moveZoom(delta, {
      x: event.clientX,
      y: event.clientY - headerHeight,
    });
    requestAnimationFrame(() => {
      mapMove.doSlide("zoom");
    });
  };

  return {
    moveMouse,
    moveWheel,
  };
};
