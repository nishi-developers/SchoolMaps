import type { LocationQueryValue } from "vue-router";

type Config = {};
const defaultConfig: Config = {};

type Status = {
  mode: string | null;
  floor: string;
  places: Array<string>;
};

export const useMapStatus = (config: Config = defaultConfig) => {
  const { $modes, $floors, $places } = useNuxtApp();
  const route = useRoute();

  const changeableModes = computed(() => {
    return $modes.value.filter((mode) => !mode.always && mode.enable);
  });

  const changeableFloors = computed(() => {
    return $floors.value.filter((floor) => !floor.always);
  });

  const status = ref<Status>({
    mode: null,
    floor: changeableFloors.value[0]?.id as string,
    places: [],
  });

  // セッター(バリデーション付き)
  const setMode = (modeId: string | null) => {
    if (modeId && changeableModes.value.some((mode) => mode.id === modeId)) {
      status.value.mode = modeId;
    } else {
      status.value.mode = null;
    }
    status2url();
  };
  const setFloor = (floorId: string | null) => {
    if (floorId && changeableFloors.value.some((floor) => floor.id === floorId)) {
      status.value.floor = floorId;
    } else {
      status.value.floor = changeableFloors.value[0]?.id as string;
    }
    status2url();
  };
  const setPlaces = (placeIds: Array<string> | null) => {
    if (placeIds) {
      const validPlaceIds = placeIds.filter((placeId) => $places.value.some((p) => p.id === placeId));
      status.value.places = validPlaceIds;
    } else {
      status.value.places = [];
    }
    status2url();
  };

  const helper_checkString = (value: string | null | undefined | LocationQueryValue[]) => {
    return typeof value === "string" && value.trim() !== "";
  };
  // URLを解決して状態に反映
  const url2status = () => {
    const url = {
      mode: helper_checkString(route.query.mode) ? (route.query.mode as string) : null,
      floor: helper_checkString(route.query.floor) ? (route.query.floor as string) : null,
      places: (() => {
        const placesParam = route.query.places;
        if (typeof placesParam === "string") {
          return placesParam.split(",").filter((place) => place.trim() !== "");
        } else if (Array.isArray(placesParam)) {
          return placesParam.filter((place) => typeof place === "string" && place.trim() !== "") as string[];
        }
        return [];
      })(),
    } as const;

    // places優先で処理
    if (url.places.length === 1) {
      // placesが1つのときは、そのplaceのmodeとfloorにする
      setPlaces(url.places);
      const place = $places.value.find((p) => p.id === status.value.places[0]);
      if (place) {
        setMode(place.mode);
        setFloor(place.floor);
        return;
      }
      // placesが不正なときは、modeとfloorの設定に合流
    } else if (url.places.length > 1) {
      // placesが複数のときは、そのままplacesに入れる。ただし、modeとfloorはplacesの最初の要素に合わせる
      setPlaces(url.places);
      const firstPlace = $places.value.find((p) => p.id === status.value.places[0]);
      if (firstPlace) {
        setMode(firstPlace.mode);
        setFloor(firstPlace.floor);
        return;
      }
      // placesが全て不正なときは、modeとfloorの設定に合流
    }
    // placesがないときは、modeとfloorをURLから設定する
    // placesにてエラーなどで、modeとfloorが設定できなかった場合もここに来る
    setMode(url.mode);
    setFloor(url.floor);
    setPlaces(null);
  };

  // URLに状態を反映
  const status2url = async () => {
    const query: { mode?: string; floor?: string; places?: string } = {};
    if (status.value.mode) {
      query.mode = status.value.mode;
    }
    if (status.value.floor) {
      query.floor = status.value.floor;
    }
    if (status.value.places.length > 0) {
      query.places = status.value.places.join(",");
    }
    await navigateTo({
      name: "index",
      query: query,
      replace: true,
    });
  };

  return {
    status: readonly(status),
    url2status,
    changeableModes,
    changeableFloors,
  };
};

// https://maps.nishi-h.net/?mode=shinkan80&floor=f1&places=grand,gym

// 検索結果も、placesに複数いれることで対応
// placesが1つのときのみpropertyを表示する
