type Config = {
  propertySizeRate: {
    middle: number;
    max: number;
  };
};
const defaultConfig: Config = {
  propertySizeRate: {
    middle: 0.3,
    max: 0.9,
  },
};

export const usePropertySlider = (
  deviceMode: Ref<"mobile" | "pc">,
  props: { viewsize: ViewSize },
  closeProperty = () => {},
  config: Config = defaultConfig
) => {
  const propertySize = ref(0);

  // 初回時またはモード変更時にサイズをリセット
  watch(
    deviceMode,
    (mode) => {
      if (mode === "mobile") {
        propertySize.value = props.viewsize.height * config.propertySizeRate.middle;
      } else {
        propertySize.value = props.viewsize.width * config.propertySizeRate.middle;
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
      if (propertySize.value < (props.viewsize.height * config.propertySizeRate.middle) / 2) {
        closeProperty();
      } else if (
        propertySize.value >
        (props.viewsize.height * config.propertySizeRate.middle + props.viewsize.height * config.propertySizeRate.max) /
          2
      ) {
        propertySize.value = props.viewsize.height * config.propertySizeRate.max;
      } else {
        propertySize.value = props.viewsize.height * config.propertySizeRate.middle;
      }
    } else {
      if (propertySize.value < (props.viewsize.width * config.propertySizeRate.middle) / 2) {
        closeProperty();
      } else if (
        propertySize.value >
        (props.viewsize.width * config.propertySizeRate.middle + props.viewsize.width * config.propertySizeRate.max) / 2
      ) {
        propertySize.value = props.viewsize.width * config.propertySizeRate.max;
      } else {
        propertySize.value = props.viewsize.width * config.propertySizeRate.middle;
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
