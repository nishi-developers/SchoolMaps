export const useMapEvent = (
  mapStatus: ReturnType<typeof useMapStatus>,
  setPlaces: (places: Array<string | null> | null) => void
) => {
  const { $modes, $floors } = useNuxtApp();

  const clickPlace = (event: Event) => {
    const targetPlaceId = (event.target as HTMLElement).getAttribute("place");
    setPlaces([targetPlaceId]); // 存在しないID(nullとか)が来た場合はsetPlacesで弾かれる
  };

  const floorsButtonData = $floors.value
    .filter((floor) => !floor.always)
    .map((floor) => ({
      id: floor.id,
      name: floor.name,
    }));
  const modesButtonData = $modes.value
    .filter((mode) => !mode.always && mode.enable)
    .map((mode) => ({
      id: mode.id,
      name: mode.name,
    }));
  const setFloor = (floorId: string | null) => {
    if (floorId === null || mapStatus.status.value.floor === floorId) {
      // 同じ階が選択されても何もしない
      return;
    }
    mapStatus.setPlaces(null);
    mapStatus.setFloor(floorId);
  };
  const setMode = (modeId: string | null) => {
    if (mapStatus.status.value.mode === modeId) {
      // 同じモードが選択されたらモード解除
      mapStatus.setMode(null);
    } else {
      mapStatus.setMode(modeId);
    }
    mapStatus.setPlaces(null);
  };

  return {
    clickPlace,
    floorsButtonData,
    modesButtonData,
    setFloor,
    setMode,
  };
};
