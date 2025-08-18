type MapMoveType = "position" | "zoom" | "rotate";
type FrictionConfig = {
  position: number;
  zoom: number;
  rotate: number;
  min: number;
};

export const useMapMove = (
  frictionConfig: FrictionConfig = {
    position: 0.97,
    zoom: 0.97,
    rotate: 0.97,
    min: 0.001,
  } as const
) => {
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
  };
  // setters
  const setPosition = (x: number, y: number) => {
    status.value.position.x = x;
    status.value.position.y = y;
  };
  const setZoom = (zoom: number) => {
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

  // 個別の移動関数
  const movePosition = (diffX: number, diffY: number): void => {
    if (diffX === 0 && diffY === 0) return;
    slideData.position.stopFlag = true;
    setPosition(status.value.position.x + diffX, status.value.position.y + diffY);
    updateSpeed("position", { x: diffX, y: diffY });
  };
  const moveZoom = (diffZoom: number): void => {
    if (diffZoom === 0) return;
    slideData.position.stopFlag = true;
    setZoom(status.value.zoom + diffZoom);
    updateSpeed("zoom", diffZoom);
  };
  const moveRotate = (diffRotate: number): void => {
    if (diffRotate === 0) return;
    slideData.position.stopFlag = true;
    setRotate(status.value.rotate + diffRotate);
    updateSpeed("rotate", diffRotate);
  };

  // ヘルパー関数群
  const isSpeedValid = (type: MapMoveType): boolean => {
    switch (type) {
      case "position":
        return isFinite(slideData.position.speed.x) && isFinite(slideData.position.speed.y);
      case "zoom":
        return isFinite(slideData.zoom.speed);
      case "rotate":
        return isFinite(slideData.rotate.speed);
    }
  };
  const hasMinimumSpeed = (type: MapMoveType): boolean => {
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
  const applySlideMovement = (type: MapMoveType, deltaTime: number) => {
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
        setZoom(status.value.zoom + slideData.zoom.speed * deltaTime);
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
    if (!isSpeedValid(type)) {
      slideReset(type);
      return;
    }
    slideData.position.stopFlag = false;
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
    if (hasMinimumSpeed(type)) {
      const now = performance.now();
      const deltaTime = slideData[type].lastSlideTime ? now - slideData[type].lastSlideTime : 16.67; // 初回は60FPSを仮定
      slideData[type].lastSlideTime = now;
      applySlideMovement(type, deltaTime);
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

  const reset = (width: number, height: number) => {
    slideReset();
    setZoom(1);
    setRotate(0);
    setPosition(width / 2, height / 2);
  };

  return {
    status: readonly(status),
    setPosition,
    setZoom,
    setRotate,
    movePosition,
    moveZoom,
    moveRotate,
    slideReset,
    doSlide,
    reset,
  };
};
