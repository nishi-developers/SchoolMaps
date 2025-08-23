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
  const { $map, $modes, $behaviors, $places } = useNuxtApp();
  let mapElement: HTMLElement | null = null;

  const init = (mapWrapper: HTMLElement) => {
    mapWrapper.appendChild($map.value);
    mapElement = mapWrapper.children[0] as HTMLElement;
    //
    deleteDisabledModeObj();
    addLabels();
    applyDefaultStyle();
    // moveStatusの監視を開始
    watch(
      moveStatus,
      () => {
        // マップの位置を更新
        applyMove();
      },
      { immediate: true, deep: true }
    );
    // ダークモードの変更を検知
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      applyDefaultStyle();
    });
  };

  const applyMove = () => {
    if (!mapElement) {
      return;
    }
    // 初期用(要移動)
    mapElement.style.position = "absolute";
    mapElement.style.overflow = "visible";
    //
    mapElement.style.top = `${moveStatus.value.position.y}px`;
    mapElement.style.left = `${moveStatus.value.position.x}px`;
    mapElement.style.rotate = `${moveStatus.value.rotate}deg`;
    mapElement.style.scale = `${moveStatus.value.zoom}`;
    //
    mapElement.querySelectorAll("[label]").forEach((element: Element) => {
      (element as HTMLElement).style.rotate = `${-moveStatus.value.rotate}deg`;
      (element as HTMLElement).style.scale = `${1 / moveStatus.value.zoom}`;
    });
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

  const addLabels = () => {
    const placeBehaviors = $behaviors.value.filter((behavior: Behavior) => behavior.isPlace);
    for (const behavior of placeBehaviors) {
      mapElement?.querySelectorAll(`[behavior="${behavior.id}"]`).forEach((element) => {
        const bBox = (element as SVGGraphicsElement).getBBox();
        const centerX = bBox.x + bBox.width / 2;
        const centerY = bBox.y + bBox.height / 2;
        const placeId = element.getAttribute("place");
        const name = $places.value.find((place: Place) => place.id === placeId)?.name || null;
        if (!name || !mapElement) {
          return;
        }
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute("x", `${centerX}`);
        textElement.setAttribute("y", `${centerY}`);
        textElement.setAttribute("label", "");
        textElement.setAttribute("mode", element.getAttribute("mode") || "");
        textElement.setAttribute("floor", element.getAttribute("floor") || "");
        textElement.setAttribute("behavior", behavior.id);
        textElement.setAttribute("place", placeId || "");
        textElement.textContent = name;
        textElement.style.textAnchor = "middle";
        textElement.style.dominantBaseline = "central";
        textElement.style.transformBox = "fill-box";
        textElement.style.transformOrigin = "center center";
        textElement.style.pointerEvents = "none";
        textElement.style.strokeWidth = "0";
        // textElement.style.translate = "-50% +25%";
        mapElement.appendChild(textElement);
      });
    }
  };

  const applyDefaultStyle = () => {
    for (const behavior of $behaviors.value) {
      // エレメント
      const elements = mapElement?.querySelectorAll(`[behavior="${behavior.id}"]:not([label])`);
      elements?.forEach((element: Element) => {
        if (!behavior.style) {
          return;
        }
        const bodyStyle = behavior.style.body;
        (element as HTMLElement).style.strokeWidth = `${bodyStyle.strokeWidth}px`;
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          // ダークモード
          (element as HTMLElement).style.fill = bodyStyle.fillDefault.dark;
          (element as HTMLElement).style.stroke = bodyStyle.stroke.dark;
        } else {
          // ライトモード
          (element as HTMLElement).style.fill = bodyStyle.fillDefault.light;
          (element as HTMLElement).style.stroke = bodyStyle.stroke.light;
        }
      });
      // ラベル
      const labelElements = mapElement?.querySelectorAll(`[behavior="${behavior.id}"][label]`);
      labelElements?.forEach((element: Element) => {
        if (!behavior.style?.label) {
          return;
        }
        const labelStyle = behavior.style.label;
        (element as HTMLElement).style.fontSize = labelStyle.fontSize;
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          // ダークモード
          (element as HTMLElement).style.fill = labelStyle.fill.dark;
        } else {
          // ライトモード
          (element as HTMLElement).style.fill = labelStyle.fill.light;
        }
      });
    }
  };

  // チェック時に、表示されているものに限って計算したいため、
  // 一旦今は保留
  const fixLabelFontSize = () => {
    const labelElements = Array.from(mapElement?.querySelectorAll("[label]") || []);
    const overlappingElementsIds = new Set<string>();

    labelElements.forEach((element, index) => {
      const elementPlaceId = element.getAttribute("place");
      if (!elementPlaceId || overlappingElementsIds.has(elementPlaceId)) {
        return;
      }
      const rect = element.getBoundingClientRect();
      // 残りの要素のみをチェック
      labelElements.slice(index + 1).forEach((el) => {
        const elPlaceId = el.getAttribute("place");
        if (!elPlaceId) return;
        const elRect = el.getBoundingClientRect();
        // 衝突判定
        if (
          rect.left < elRect.right &&
          rect.right > elRect.left &&
          rect.top < elRect.bottom &&
          rect.bottom > elRect.top
        ) {
          overlappingElementsIds.add(elementPlaceId);
          overlappingElementsIds.add(elPlaceId);
        }
      });
    });
    overlappingElementsIds.forEach((placeId) => {
      const elements = mapElement?.querySelectorAll(`[place="${placeId}"][label]`);
      elements?.forEach((element: Element) => {
        const nowFontSize = parseFloat((element as HTMLElement).style.fontSize);
        (element as HTMLElement).style.fontSize = `${nowFontSize * 0.8}rem`; // フォントサイズを80%に縮小
      });
    });
  };
  return { init };
};
