import RBush from "rbush";

export const useMapView = (mapStatus: Ref<MapStatus>, moveStatus: Ref<MapMoveStatus>, isShowLabel: Ref<boolean>) => {
  const { $map, $modes, $floors, $behaviors, $places } = useNuxtApp();
  let mapElement: HTMLElement | null = null;
  const isWebKit = () => {
    return /webkit/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
  };
  const init = (mapWrapper: HTMLElement) => {
    // $map.valueを汚染しないように複製してから使用
    const clonedMap = $map.value.cloneNode(true) as HTMLElement;
    mapWrapper.appendChild(clonedMap);
    mapElement = mapWrapper.children[0] as HTMLElement;
    applyInitStyle();
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
        applyMapStatusModeAndFloor();
        applyMapStatusPlaces();
        applyMove(); // applyMapStatusModeAndFloorの後に実行する必要がある(ラベルの表示状態が変わるため)
      },
      { immediate: true, deep: true }
    );
    // label用のwathch(負荷軽減のために無駄な実行を避ける)
    watch(
      () => [isShowLabel, moveStatus.value.rotate, moveStatus.value.zoom, mapStatus.value.mode, mapStatus.value.floor],
      () => {
        applyLabelVisibility();
      },
      { immediate: true, deep: true }
    );
    // ダークモードの変更を検知
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      applyDefaultStyle();
      applyMapStatusPlaces();
    });
  };

  const applyInitStyle = () => {
    if (!mapElement) {
      return;
    }
    mapElement.style.position = "absolute";
    mapElement.style.overflow = "visible";
    mapElement.style.transformBox = "fill-box";
  };

  const applyMove = () => {
    if (!mapElement) {
      return;
    }
    //
    mapElement.style.top = `${moveStatus.value.position.y}px`;
    mapElement.style.left = `${moveStatus.value.position.x}px`;
    mapElement.style.rotate = `${moveStatus.value.rotate}deg`;
    mapElement.style.scale = `${moveStatus.value.zoom}`;
    //
    mapElement.querySelectorAll("[label]:not([style*='display: none'])").forEach((element: Element) => {
      if (!isWebKit()) {
        (element as HTMLElement).style.rotate = `${-moveStatus.value.rotate}deg`;
        (element as HTMLElement).style.scale = `${1 / moveStatus.value.zoom}`;
      } else {
        helper_applyWebkitRotateAndZoom(element);
      }
    });
  };

  const helper_applyWebkitRotateAndZoom = (element: Element) => {
    // safari(webkit)では、transformOriginが効かないバグがある
    // そのため、g要素でラベルを囲み、g要素に対してSVGネイティブのtransform属性を使う
    // 要素そのものをtransformすると、要素の位置がずれるためg要素で囲む必要がある
    const bbox = (element as SVGGraphicsElement).getBBox();
    const center = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    };
    // ラベル要素を囲むg要素を取得または作成
    let g = element.parentElement as SVGElement | null;
    if (!g || g.tagName !== "g" || !g.hasAttribute("label-transform-wrapper")) {
      // g要素がなければ作成
      g = document.createElementNS("http://www.w3.org/2000/svg", "g") as SVGElement;
      if (element) {
        element.replaceWith(g);
        g.setAttribute("label-transform-wrapper", ""); // 識別用
        g.appendChild(element);
      }
    }
    // g要素に対してtransform属性を設定
    // 一度translateして中心位置に移動し、回転・拡大縮小を行い、元の位置に戻す
    g.setAttribute(
      "transform",
      `translate(${center.x}, ${center.y})` +
        " " +
        `rotate(${-moveStatus.value.rotate})` +
        " " +
        `scale(${1 / moveStatus.value.zoom})` +
        " " +
        `translate(${-center.x}, ${-center.y})`
    );
  };

  const applyMapStatusModeAndFloor = () => {
    // mode,floorの両方で表示されるものだけを表示する

    // 論理計算
    const alwaysModeIds = $modes.value.filter((mode) => mode.always && mode.enable).map((mode) => mode.id); // alwaysなmode
    const visibleModeIds = new Set<string>(
      $modes.value.filter((mode) => mode.always && mode.enable).map((mode) => mode.id) // alwaysなmode
    );
    if (mapStatus.value.mode) {
      visibleModeIds.add(mapStatus.value.mode); // 選択されているmode
    }
    const visibleFloorId = new Set<string>(
      $floors.value.filter((floor) => floor.always).map((floor) => floor.id) // alwaysなfloor
    );
    visibleFloorId.add(mapStatus.value.floor); // 選択されているfloor

    // 実行(ラベルも含む)
    const allObjects = Array.from(mapElement?.querySelectorAll("[mode][floor]") || []);
    allObjects.forEach((el) => {
      const elMode = el.getAttribute("mode");
      const elFloor = el.getAttribute("floor");
      if (elMode && elFloor && visibleModeIds.has(elMode) && visibleFloorId.has(elFloor)) {
        if (el.hasAttribute("label") && alwaysModeIds.includes(elMode) && mapStatus.value.mode) {
          // labelにおいて、alwaysなmodeで、modeが別に指定されている場合は非表示
          (el as HTMLElement).style.display = "none";
        } else {
          (el as HTMLElement).style.display = "";
        }
      } else {
        (el as HTMLElement).style.display = "none";
      }
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

  const applyLabelVisibility = () => {
    if (isShowLabel.value) {
      hideOverlappedLabel();
    } else {
      hideAllLabels();
    }
  };

  const hideAllLabels = () => {
    mapElement?.querySelectorAll("[label]:not([style*='display: none'])").forEach((element: Element) => {
      (element as HTMLElement).style.opacity = "0";
    });
  };

  const hideOverlappedLabel = () => {
    requestAnimationFrame(() => {
      const visibleLabelElements = mapElement?.querySelectorAll("[label]:not([style*='display: none'])") || [];

      const tree = new RBush();
      type Item = {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        element: Element;
        placeId: string;
      };
      const items: Array<Item> = [];

      // 要素をR-treeに追加
      visibleLabelElements.forEach((el) => {
        const placeId = el.getAttribute("place");
        if (!placeId || !el) return;
        // ラベルの位置は、getBBoxとgetBoundingClientRectを組み合わせて算出する
        // getBoundingClientRectだけでは、回転時にサイズが大きくなってしまう
        // getBBoxはtransformの影響を受けないが、フォントサイズの影響を受けるため都合が良い
        const size = {
          width: (el as SVGGraphicsElement).getBBox().width,
          height: (el as SVGGraphicsElement).getBBox().height,
        };
        const center = {
          x: el.getBoundingClientRect().x + (el.getBoundingClientRect().width || 0) / 2,
          y: el.getBoundingClientRect().y + (el.getBoundingClientRect().height || 0) / 2,
        };
        const fixedLocate = {
          minX: center.x - size.width / 2,
          minY: center.y - size.height / 2,
          maxX: center.x + size.width / 2,
          maxY: center.y + size.height / 2,
        };
        const item: Item = {
          ...fixedLocate,
          element: el,
          placeId: placeId,
        };
        items.push(item);
      });

      // 一括でツリーに挿入
      tree.load(items);

      // 各要素について衝突検知
      items.forEach((item) => {
        const collisions = tree.search(item);
        // 自分自身を除外して、2つ以上の要素があれば衝突
        if (collisions.length > 1) {
          (item.element as HTMLElement).style.opacity = "0";
        } else {
          (item.element as HTMLElement).style.opacity = "1";
        }
      });
    });
  };
  return {
    init,
  };
};
