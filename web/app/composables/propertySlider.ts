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
  let lastX = 0; // ポインタ位置の前回値
  let lastY = 0;

  const eventListener = {
    click: () => {
      if (!isAlreadyMoved) {
        closeProperty();
      }
    },
    pointerdown: (e: PointerEvent) => {
      isAlreadyMoved = false;
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;

      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId); // スライダーがポインタを捕捉（範囲外へ出てもイベントが下層へ行かない）

      e.preventDefault();
      e.stopPropagation();
    },

    pointermove: (e: PointerEvent) => {
      if (!isDragging) return;
      isAlreadyMoved = true;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (deviceMode.value === "mobile") {
        const next = propertySize.value - dy;
        if (next > 0 && next < props.viewsize.height) propertySize.value = next;
      } else {
        const next = propertySize.value + dx;
        if (next > 0 && next < props.viewsize.width) propertySize.value = next;
      }

      e.preventDefault();
      e.stopPropagation();
    },

    pointerup: (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;

      try {
        (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {
        // 何もしない
      }

      leave();
      e.preventDefault();
      e.stopPropagation();
    },

    pointercancel: (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;

      try {
        (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {
        // 何もしない
      }

      leave();
      e.preventDefault();
      e.stopPropagation();
    },
  };

  const leave = () => {
    // ポインタが離れたときの処理
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
    propertySize,
  };
};
