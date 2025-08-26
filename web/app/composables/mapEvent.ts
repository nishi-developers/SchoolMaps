export const useMapEvent = (mapStatus: Ref<MapStatus>, setPlaces: (places: Array<string | null> | null) => void) => {
  const clickPlace = (event: Event) => {
    const targetPlaceId = (event.target as HTMLElement).getAttribute("place");
    setPlaces([targetPlaceId]); // 存在しないID(nullとか)が来た場合はsetPlacesで弾かれる
  };
  const isShowLabel = ref(true);
  const setIsShowLabel = (value: boolean) => {
    isShowLabel.value = value;
  };

  return {
    clickPlace,
    isShowLabel: readonly(isShowLabel),
    setIsShowLabel,
  };
};
