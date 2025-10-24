export const useMapEvent = (
  mapState: ReturnType<typeof useMapState>,
  setPlaces: (places: Array<string | null> | null) => void
) => {
  const { $modesChangeable, $floorsChangeable } = useNuxtApp();

  const clickPlace = (event: MouseEvent) => {
    const targetPlaceId = (event.target as HTMLElement).getAttribute("place");
    if (!event.shiftKey) {
      setPlaces([targetPlaceId]); // 存在しないID(nullとか)が来た場合はsetPlacesで弾かれる
    } else {
      // Shiftキーが押されている場合は複数選択
      setPlaces([...mapState.status.value.places, targetPlaceId]); // 重複はsetPlacesで弾かれる
    }
  };

  const floorsButtonData = $floorsChangeable.value.map((floor) => ({
    id: floor.id,
    name: floor.name,
  }));
  const modesButtonData = $modesChangeable.value.map((mode) => ({
    id: mode.id,
    name: mode.name,
  }));
  const setFloor = (floorId: string | null) => {
    if (floorId === null || mapState.status.value.floor === floorId) {
      // 同じ階が選択されても何もしない
      return;
    }
    if (mapState.status.value.places.length === 1) {
      // placesが1つだけ選択されている場合、floor変更に伴いplacesをクリア
      // (複数選択されている場合はfloor変更に伴いplacesをクリアしない)
      mapState.setPlaces(null);
    }
    mapState.setFloor(floorId);
  };
  const setMode = (modeId: string | null) => {
    if (mapState.status.value.mode === modeId) {
      // 同じモードが選択されたらモード解除
      mapState.setMode(null);
    } else {
      mapState.setMode(modeId);
    }
    if (mapState.status.value.places.length === 1) {
      // placesが1つだけ選択されている場合、floor変更に伴いplacesをクリア
      // (複数選択されている場合はfloor変更に伴いplacesをクリアしない)
      mapState.setPlaces(null);
    }
  };

  return {
    clickPlace,
    floorsButtonData,
    modesButtonData,
    setFloor,
    setMode,
  };
};
