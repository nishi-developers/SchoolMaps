export const useMapMoveByMouse = (mapMove) => {
  const move = (event: MouseEvent) => {
    // マウスの移動による操作
    if (event.buttons === 1) {
      // 左クリックが押されている場合のみ
      console.log("called movePosition");

      mapMove.movePosition(event.movementX, event.movementY);
    } else if (event.buttons === 4) {
      // ホイールボタンが押されている場合のみ
      // 要実装
      // mapMove.moveCenter.x = window.innerWidth / 2;
      // mapMove.moveCenter.y = window.innerHeight / 2;
      if (event.movementX > 0) {
        mapMove.moveRotate(Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5);
      } else {
        mapMove.moveRotate(-Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5);
      }
    }
  };
  const wheel = (event: WheelEvent) => {
    // マウスのホイールによる操作
    let num = 0;
    let unit = 0.1;
    if (event.wheelDelta + unit > 0) {
      num = unit;
    } else {
      num = -unit;
    }
    // 要実装
    // mapMove.moveCenter.x = event.clientX;
    // mapMove.moveCenter.y = event.clientY - Setup.windowSize.headerHeight;
    mapMove.moveZoom(num);
    mapMove.doSlide("zoom");
  };

  return { move, wheel };
};

// memo
// スライド中に動かしてもスライドが継続してしまう
// 停止フラグで動かしたら停止するようにしたが、それでは再起で呼ばれたslideか、通常のslideか判断できず、。。
