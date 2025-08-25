type MapStatus = {
  mode: string | null;
  floor: string;
  places: readonly string[];
};

export const useMapEvent = (mapStatus: Ref<MapStatus>, setPlaces: (places: Array<string | null> | null) => void) => {
  const clickPlace = (event: Event) => {
    const targetPlaceId = (event.target as HTMLElement).getAttribute("place");
    setPlaces([targetPlaceId]); // 存在しないID(nullとか)が来た場合はsetPlacesで弾かれる
  };

  return {
    clickPlace,
  };
};
