type MoveStatus = {
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  rotate: number;
};
type MapStatus = {
  mode: string | null;
  floor: string;
  places: Array<string>;
};

export const useMapView = (mapStatus: Ref<MapStatus>, moveStatus: Ref<MoveStatus>) => {
  const { $map, $modes, $floors, $behaviors, $places } = useNuxtApp();
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
    // mapStatusの監視を開始
    watch(
      mapStatus,
      () => {
        applyMapStatusMode();
        applyMapStatusFloor();
        applyMapStatusPlaces();
        fixLabelFontSize();
      },
      { immediate: true, deep: true }
    );
    // ダークモードの変更を検知
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      applyDefaultStyle();
      applyMapStatusPlaces();
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

  const applyMapStatusMode = () => {
    // 論理計算
    const alwaysModeIds: Array<string> = $modes.value
      .filter((mode) => mode.always && mode.enable)
      .map((mode) => mode.id);
    const changeableModeIds: Array<string> = $modes.value
      .filter((mode) => !mode.always && mode.enable)
      .map((mode) => mode.id);
    const visibleModeId: string | null = mapStatus.value.mode;
    const unvisibleModeIds: Array<string> = changeableModeIds.filter((id) => id !== visibleModeId);
    // 実行
    if (visibleModeId) {
      mapElement?.querySelectorAll(`[mode="${visibleModeId}"]`).forEach((el: Element) => {
        (el as HTMLElement).style.display = "";
      });
      // modeを指定している場合は、alwaysのlabelを非表示
      alwaysModeIds.forEach((modeId) => {
        mapElement?.querySelectorAll(`[mode="${modeId}"][label]`).forEach((el: Element) => {
          (el as HTMLElement).style.display = "none";
        });
      });
    } else {
      // modeを指定していない場合は、alwaysのlabelを表示
      alwaysModeIds.forEach((modeId) => {
        mapElement?.querySelectorAll(`[mode="${modeId}"]`).forEach((el: Element) => {
          (el as HTMLElement).style.display = "";
        });
      });
    }
    unvisibleModeIds.forEach((modeId) => {
      mapElement?.querySelectorAll(`[mode="${modeId}"]`).forEach((el: Element) => {
        (el as HTMLElement).style.display = "none";
      });
    });
  };
  const applyMapStatusFloor = () => {
    // 論理計算
    // const alwaysFloorIds: Array<string> = $floors.value.filter((floor) => floor.always).map((floor) => floor.id);
    const changeableFloorIds: Array<string> = $floors.value.filter((floor) => !floor.always).map((floor) => floor.id);
    const visibleFloorId: string = mapStatus.value.floor;
    const unvisibleFloorIds: Array<string> = changeableFloorIds.filter((id) => id !== visibleFloorId);
    // 実行
    mapElement?.querySelectorAll(`[floor="${visibleFloorId}"]`).forEach((el: Element) => {
      (el as HTMLElement).style.display = "";
    });
    unvisibleFloorIds.forEach((floorId) => {
      mapElement?.querySelectorAll(`[floor="${floorId}"]`).forEach((el: Element) => {
        (el as HTMLElement).style.display = "none";
      });
    });
  };
  const applyMapStatusPlaces = () => {
    // 論理計算
    const changeablePlaces = $places.value.filter((place) =>
      $modes.value.some((mode) => mode.id === place.mode && mode.enable)
    );
    const selectedPlaces = changeablePlaces.filter((place) => mapStatus.value.places.includes(place.id));
    const unselectedPlaces = changeablePlaces.filter((place) => !mapStatus.value.places.includes(place.id));
    // 実行
    selectedPlaces.forEach((place) => {
      const selectedStyle = $behaviors.value.find((behavior: Behavior) => behavior.id === place.behavior)?.style?.body
        .fillSelect;
      if (!selectedStyle) {
        return;
      }
      mapElement?.querySelectorAll(`[place="${place.id}"]:not([label])`).forEach((el: Element) => {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          // ダークモード
          (el as HTMLElement).style.fill = selectedStyle.dark;
        } else {
          // ライトモード
          (el as HTMLElement).style.fill = selectedStyle.light;
        }
      });
    });
    unselectedPlaces.forEach((place) => {
      const defaultStyle = $behaviors.value.find((behavior: Behavior) => behavior.id === place.behavior)?.style?.body
        .fillDefault;
      if (!defaultStyle) {
        return;
      }
      mapElement?.querySelectorAll(`[place="${place.id}"]:not([label])`).forEach((el: Element) => {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          // ダークモード
          (el as HTMLElement).style.fill = defaultStyle.dark;
        } else {
          // ライトモード
          (el as HTMLElement).style.fill = defaultStyle.light;
        }
      });
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
