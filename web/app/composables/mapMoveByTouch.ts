type Config = {
  positionSlipLimit: number;
  zoomUnit: number;
  restriction: {
    zoom: number;
    rotate: number;
  };
};
const defaultConfig: Config = {
  positionSlipLimit: 50, // タッチの移動量がこの値を超えたら、指が離れたとみなして初期化する
  zoomUnit: 0.004, // ズームの単位
  restriction: {
    zoom: 5000, // ズームをブロックする移動量
    rotate: 75, // 回転を許可する移動量
  },
};

export const useMapMoveByTouch = (
  mapMove: ReturnType<typeof useMapMove>,
  headerHeight: number,
  config: Config = defaultConfig
) => {
  const last = {
    position: { x: 0, y: 0 },
    rotate: 0,
    zoomLength: 0,
    fingerNum: 0,
  };
  // 回転やズームの制限をするため、タップし始めてどれぐらい動かしたか
  const restrictionCount = {
    zoom: 0,
    rotate: 0,
  };

  const positionLength = (x1: number, y1: number, x2: number, y2: number) => {
    // 2点間の距離を計算する関数
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  };
  const positionAverage = (event: TouchEvent) => {
    // タッチの位置を取得する関数
    // タッチの指が複数ある場合は、それぞれの位置を取得して平均を取る
    let x = 0;
    let y = 0;
    for (const i of event.changedTouches) {
      x += i.clientX;
      y += i.clientY;
    }
    return { x: x / event.changedTouches.length, y: y / event.changedTouches.length };
  };
  const calcTwoTouch = (event: TouchEvent) => {
    // 2本の指の位置を取得する関数
    const touch0 = event.changedTouches[0] as { clientX: number; clientY: number };
    const touch1 = event.changedTouches[1] as { clientX: number; clientY: number };
    return {
      touch0,
      touch1,
    };
  };

  const init = (event: TouchEvent) => {
    // タップし始めは、初期処理をあてるために値を変更
    last.fingerNum = event.changedTouches.length;
    ({ x: last.position.x, y: last.position.y } = positionAverage(event));
    // タップし始めてどれぐらい動かしたらをリセット
    restrictionCount.zoom = 0;
    restrictionCount.rotate = 0;
    if (event.changedTouches.length === 2) {
      //zoomRotateモードの初期処理
      const { touch0, touch1 } = calcTwoTouch(event);
      last.rotate = Math.atan2(touch1.clientY - touch0.clientY, touch1.clientX - touch0.clientX) * (180 / Math.PI);
      last.zoomLength = positionLength(touch0.clientX, touch0.clientY, touch1.clientX, touch1.clientY);
    }
  };

  const move = (event: TouchEvent) => {
    const positionNow = positionAverage(event);
    // 指の本数が変わった場合、もしくは距離が飛んだ場合は初期処理
    if (
      last.fingerNum != event.changedTouches.length ||
      positionLength(last.position.x, last.position.y, positionNow.x, positionNow.y) > config.positionSlipLimit
    ) {
      init(event);
    }
    // position 指の移動量を計算して、前の位置との差分を移動
    mapMove.movePosition(positionNow.x - last.position.x, positionNow.y - last.position.y);
    ({ x: last.position.x, y: last.position.y } = positionNow); // 最終値を更新
    if (event.changedTouches.length === 2) {
      // 指が2本以上の場合は、ズームと回転
      const { touch0, touch1 } = calcTwoTouch(event);
      // zoom 指の間隔を計算して、前との差からズームレベルを変更
      const zoomLength = positionLength(touch0.clientX, touch0.clientY, touch1.clientX, touch1.clientY);
      const center = {
        x: positionAverage(event).x,
        y: positionAverage(event).y - headerHeight,
      };
      mapMove.moveZoom((zoomLength - last.zoomLength) * config.zoomUnit, center);
      restrictionCount.zoom += Math.abs(length - last.zoomLength); //ズームした合計量を記録
      last.zoomLength = zoomLength; //最終値を更新
      // rotate 2点を結ぶ直線の傾きを計算して、前との差から回転角度を変更
      const rotate = Math.atan2(touch1.clientY - touch0.clientY, touch1.clientX - touch0.clientX) * (180 / Math.PI);
      restrictionCount.rotate += Math.abs(rotate - last.rotate); //回転した合計量を記録
      if (restrictionCount.rotate > config.restriction.rotate && restrictionCount.zoom < config.restriction.zoom) {
        // ズームの制限を超えず、回転の制限を超えた場合のみ回転を行う
        mapMove.moveRotate(rotate - last.rotate, center);
        last.rotate = rotate; //最終値を更新
      }
    }
  };
  return {
    move,
    init,
  };
};
