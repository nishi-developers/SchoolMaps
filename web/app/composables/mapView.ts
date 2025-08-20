type Config = {};
const defaultConfig: Config = {};

type MoveStatus = {
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  rotate: number;
};

export const useMapView = (moveStatus: Ref<MoveStatus>, config: Config = defaultConfig) => {
  const { $map, $modes, $behaviors } = useNuxtApp();
  let mapElement: HTMLElement | null = null;

  const init = (mapWrapper: HTMLElement) => {
    mapWrapper.appendChild($map.value);
    mapElement = mapWrapper.children[0] as HTMLElement;
    //
    deleteDisabledModeObj();
    // moveStatusの監視を開始
    watch(
      moveStatus,
      () => {
        // マップの位置を更新
        applyMove();
      },
      { immediate: true, deep: true }
    );
  };

  const applyMove = () => {
    if (mapElement) {
      // 初期用(要移動)
      mapElement.style.position = "absolute";
      mapElement.style.overflow = "visible";
      //
      mapElement.style.top = `${moveStatus.value.position.y}px`;
      mapElement.style.left = `${moveStatus.value.position.x}px`;
      mapElement.style.transform = `rotate(${moveStatus.value.rotate}deg)`;
      mapElement.style.transform += ` scale(${moveStatus.value.zoom})`;
    }
  };

  const deleteDisabledModeObj = () => {
    $modes.value.forEach((mode: Mode) => {
      if (!mode.enable) {
        mapElement?.querySelectorAll(`[mode="${mode.id}"]`).forEach((el: Element) => {
          el.remove();
        });
      }
    });
  };

  const applyDefaultStyle = () => {};

  return { init };
};
