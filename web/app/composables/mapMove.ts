type MapMoveType = "position" | "zoom" | "rotate";
type Config = {
  friction: {
    position: number;
    zoom: number;
    rotate: number;
    min: number;
  };
};
type Center = {
  x: number;
  y: number;
};
const defaultConfig: Config = {
  friction: {
    position: 0.9,
    zoom: 0.9,
    rotate: 0.9,
    min: 0.01,
  },
};

export const useMapMove = (config: Config = defaultConfig) => {
  const { $detail } = useNuxtApp();
  const status = ref({
    position: {
      x: 0,
      y: 0,
    },
    zoom: 1,
    rotate: 0,
  });
  const slideData = {
    position: {
      speed: {
        x: 0 as number,
        y: 0 as number,
      },
      lastMovedTime: null as number | null,
      isSlideing: false as boolean,
      lastSlideTime: null as number | null,
      stopFlag: false as boolean,
    },
    zoom: {
      speed: 0 as number,
      lastMovedTime: null as number | null,
      isSlideing: false as boolean,
      lastSlideTime: null as number | null,
      stopFlag: false as boolean,
    },
    rotate: {
      speed: 0,
      lastMovedTime: null as number | null,
      isSlideing: false as boolean,
      lastSlideTime: null as number | null,
      stopFlag: false as boolean,
    },
    center: {
      x: 0 as number,
      y: 0 as number,
    },
  };
  // setters
  const setPosition = (x: number, y: number) => {
    status.value.position.x = x;
    status.value.position.y = y;
  };
  const setZoom = (zoom: number, moveCenter: Center | null = null) => {
    // ズームに伴う位置調整
    if (moveCenter) {
      const zoomRatio = zoom / status.value.zoom;
      // status.value.positionは、zoom倍率が一切適用されていない、左上を基準とした位置
      // そのため、画面中央を基準としたマップの位置(mapCenter)を計算する
      const mapCenter = {
        x: status.value.position.x + $detail.value.width / 2,
        y: status.value.position.y + $detail.value.height / 2,
      };
      // moveCenterが、拡大によってどれだけ移動したかを計算
      const deltaX = (moveCenter.x - mapCenter.x) * (zoomRatio - 1);
      const deltaY = (moveCenter.y - mapCenter.y) * (zoomRatio - 1);
      // 位置を更新(moveCenterの移動分を引く)
      setPosition(status.value.position.x - deltaX, status.value.position.y - deltaY);
    }
    // zoomの更新
    status.value.zoom = zoom;
  };
  const setRotate = (rotate: number) => {
    status.value.rotate = rotate;
  };
  // 速度計算の共通関数
  const updateSpeed = (type: MapMoveType, diff: number | { x: number; y: number }) => {
    const now = performance.now();
    const slideInfo = slideData[type];
    if (slideInfo.lastMovedTime !== null) {
      const timeDiff = now - slideInfo.lastMovedTime;
      if (timeDiff <= 0) {
        return;
      }
      if (type === "position" && typeof diff === "object") {
        slideData.position.speed.x = diff.x / timeDiff;
        slideData.position.speed.y = diff.y / timeDiff;
      } else if (type === "zoom" && typeof diff === "number") {
        slideData.zoom.speed = diff / timeDiff;
      } else if (type === "rotate" && typeof diff === "number") {
        slideData.rotate.speed = diff / timeDiff;
      }
    }
    slideInfo.lastMovedTime = now;
  };
  const updateCenter = (x: number, y: number) => {
    slideData.center.x = x;
    slideData.center.y = y;
  };

  // 個別の移動関数
  const movePosition = (diffX: number, diffY: number): void => {
    if (diffX === 0 && diffY === 0) return;
    slideData.position.stopFlag = true;
    setPosition(status.value.position.x + diffX, status.value.position.y + diffY);
    updateSpeed("position", { x: diffX, y: diffY });
  };
  const moveZoom = (diffZoom: number, center: Center): void => {
    if (diffZoom === 0) return;
    slideData.position.stopFlag = true;
    setZoom(status.value.zoom + diffZoom, center);
    updateSpeed("zoom", diffZoom);
    updateCenter(center.x, center.y);
  };
  const moveRotate = (diffRotate: number, center: Center): void => {
    if (diffRotate === 0) return;
    slideData.position.stopFlag = true;
    setRotate(status.value.rotate + diffRotate);
    updateSpeed("rotate", diffRotate);
    updateCenter(center.x, center.y);
  };

  // ヘルパー関数群
  const helper_isSpeedValid = (type: MapMoveType): boolean => {
    switch (type) {
      case "position":
        return isFinite(slideData.position.speed.x) && isFinite(slideData.position.speed.y);
      case "zoom":
        return isFinite(slideData.zoom.speed);
      case "rotate":
        return isFinite(slideData.rotate.speed);
    }
  };
  const helper_hasMinimumSpeed = (type: MapMoveType): boolean => {
    const frictionConfig = config.friction;
    switch (type) {
      case "position":
        return (
          Math.abs(slideData.position.speed.x) > frictionConfig.min ||
          Math.abs(slideData.position.speed.y) > frictionConfig.min
        );
      case "zoom":
        return Math.abs(slideData.zoom.speed) > frictionConfig.min;
      case "rotate":
        return Math.abs(slideData.rotate.speed) > frictionConfig.min;
    }
  };
  const helper_applySlideMovement = (type: MapMoveType, deltaTime: number, center: Center) => {
    const frictionConfig = config.friction;
    switch (type) {
      case "position":
        setPosition(
          status.value.position.x + slideData.position.speed.x * deltaTime,
          status.value.position.y + slideData.position.speed.y * deltaTime
        );
        slideData.position.speed.x *= frictionConfig.position;
        slideData.position.speed.y *= frictionConfig.position;
        break;
      case "zoom":
        setZoom(status.value.zoom + slideData.zoom.speed * deltaTime, center);
        slideData.zoom.speed *= frictionConfig.zoom;
        break;
      case "rotate":
        setRotate(status.value.rotate + slideData.rotate.speed * deltaTime);
        slideData.rotate.speed *= frictionConfig.rotate;
        break;
    }
  };

  // メイン関数
  const slideReset = (type: MapMoveType | null = null) => {
    const types = type ? [type] : (["position", "zoom", "rotate"] as MapMoveType[]);
    types.forEach((t) => {
      if (t === "position") {
        slideData.position.speed.x = 0;
        slideData.position.speed.y = 0;
      } else {
        slideData[t].speed = 0;
      }
      slideData[t].lastMovedTime = null;
      slideData[t].isSlideing = false;
      slideData[t].lastSlideTime = null;
      slideData[t].stopFlag = true;
    });
  };

  const doSlide = (type: MapMoveType) => {
    // 速度が無効な場合はリセット
    if (!helper_isSpeedValid(type)) {
      slideReset(type);
      return;
    }
    slideData[type].stopFlag = false;
    slide(type);
  };

  const slide = (type: MapMoveType) => {
    // 重複実行防止
    if (slideData[type].isSlideing) return;
    // フラグを確認
    if (slideData[type].stopFlag) {
      slideReset(type);
      return;
    }
    slideData[type].isSlideing = true;
    // 最小速度以上の場合は継続
    if (helper_hasMinimumSpeed(type)) {
      const now = performance.now();
      const deltaTime = slideData[type].lastSlideTime ? now - slideData[type].lastSlideTime : 16.67; // 初回は60FPSを仮定
      slideData[type].lastSlideTime = now;
      helper_applySlideMovement(type, deltaTime, slideData.center);
      // requestAnimationFrameで次のフレームに実行
      requestAnimationFrame(() => {
        slideData[type].isSlideing = false;
        slide(type);
      });
    } else {
      // 速度が小さくなったらリセット
      slideData[type].isSlideing = false;
      slideReset(type);
    }
  };

  const reset = () => {
    slideReset();
    setRotate(0);
    // setPositionで指定する位置は、zoom適用前の位置のため、このように計算
    setPosition((window.innerWidth - $detail.value.width) / 2, (window.innerHeight - $detail.value.height) / 2);
    const zoomWidth = window.innerWidth / $detail.value.width;
    const zoomHeight = window.innerHeight / $detail.value.height;
    setZoom(Math.min(zoomWidth, zoomHeight));
  };

  return {
    status: readonly(status),
    movePosition,
    moveZoom,
    moveRotate,
    slideReset,
    doSlide,
    reset,
  };
};
