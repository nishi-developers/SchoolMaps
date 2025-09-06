export const usePropertySlider = (
  deviceMode: Ref<"mobile" | "pc">,
  props: { viewsize: ViewSize },
  closeProperty = () => {},
  propertySizeMiddleRate: number = 0.3,
  propertySizeMaxRate: number = 0.9
) => {
  const propertySize = ref(0);

  // 初回時またはモード変更時にサイズをリセット
  watch(
    deviceMode,
    (mode) => {
      if (mode === "mobile") {
        propertySize.value = props.viewsize.height * propertySizeMiddleRate;
      } else {
        propertySize.value = props.viewsize.width * propertySizeMiddleRate;
      }
    },
    { immediate: true }
  );

  let isAlreadyMoved = false; // マウス使用時のみ、移動したかどうか
  let isDragging = false; // ドラッグ中かどうか

  const eventListener = {
    click: () => {
      if (!isAlreadyMoved) {
        closeProperty();
      }
    },
    mousedown: () => {
      isAlreadyMoved = false;
      isDragging = true;
    },
    touchmove: (event: TouchEvent) => {
      if (event.changedTouches.length === 1) {
        touchMove(event);
      }
    },
    touchstart: (event: TouchEvent) => {
      if (event.changedTouches.length === 1) {
        touchStart(event);
      }
    },
    touchend: () => {
      leave();
    },
    touchcancel: () => {
      leave();
    },
  };

  // isAlreadyMovedとisDraggingが正しく動いているか要確認
  const mousemoveEvent = (event: MouseEvent) => {
    if (!isDragging) return;
    if (event.buttons == 1) {
      isAlreadyMoved = true;
      mouseMove(event);
    }
  };
  const mouseupEvent = () => {
    if (!isDragging) return;
    isDragging = false;
    leave();
  };
  const addEventListeners = () => {
    document.addEventListener("mousemove", mousemoveEvent);
    document.addEventListener("mouseup", mouseupEvent);
  };
  const removeEventListeners = () => {
    document.removeEventListener("mousemove", mousemoveEvent);
    document.removeEventListener("mouseup", mouseupEvent);
  };

  // ヘルパー関数群
  const mouseMove = (event: MouseEvent) => {
    // マウスでドラッグ中の処理
    if (deviceMode.value == "mobile") {
      if (propertySize.value - event.movementY > 0 && propertySize.value - event.movementY < props.viewsize.height)
        propertySize.value -= event.movementY;
    } else {
      if (propertySize.value + event.movementX > 0 && propertySize.value + event.movementX < props.viewsize.width)
        propertySize.value += event.movementX;
    }
  };
  let touchLast = 0;
  const touchStart = (event: TouchEvent) => {
    // タッチでドラッグ開始時の処理
    if (deviceMode.value == "mobile") {
      touchLast = event.changedTouches[0]?.clientY || 0;
    } else {
      touchLast = event.changedTouches[0]?.clientX || 0;
    }
  };
  const touchMove = (event: TouchEvent) => {
    // タッチでドラッグ中の処理
    if (deviceMode.value == "mobile") {
      const Y = touchLast - (event.changedTouches[0]?.clientY || 0);
      touchLast = event.changedTouches[0]?.clientY || 0;
      if (propertySize.value + Y > 0 && propertySize.value + Y < props.viewsize.height) propertySize.value += Y;
    } else {
      const X = touchLast - (event.changedTouches[0]?.clientX || 0);
      touchLast = event.changedTouches[0]?.clientX || 0;
      if (propertySize.value - X > 0 && propertySize.value - X < props.viewsize.width) propertySize.value -= X;
    }
  };
  const leave = () => {
    // マウス・タッチが離れたときの処理
    if (deviceMode.value == "mobile") {
      if (propertySize.value < (props.viewsize.height * propertySizeMiddleRate) / 2) {
        // 閉じる
        closeProperty();
      } else if (
        propertySize.value >
        (props.viewsize.height * propertySizeMiddleRate + props.viewsize.height * propertySizeMaxRate) / 2
      ) {
        // 最大化
        propertySize.value = props.viewsize.height * propertySizeMaxRate;
      } else {
        propertySize.value = props.viewsize.height * propertySizeMiddleRate;
      }
    } else {
      if (propertySize.value < (props.viewsize.width * propertySizeMiddleRate) / 2) {
        // 閉じる
        closeProperty();
      } else if (
        propertySize.value >
        (props.viewsize.width * propertySizeMiddleRate + props.viewsize.width * propertySizeMaxRate) / 2
      ) {
        // 最大化
        propertySize.value = props.viewsize.width * propertySizeMaxRate;
      } else {
        propertySize.value = props.viewsize.width * propertySizeMiddleRate;
      }
    }
  };

  return {
    eventListener,
    addEventListeners,
    removeEventListeners,
    propertySize,
  };
};
