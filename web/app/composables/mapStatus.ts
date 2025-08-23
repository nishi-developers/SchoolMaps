type Config = {};
const defaultConfig: Config = {};

type Status = {
  mode: string;
  floor: string;
  place: string | null;
  search: {
    isAndSearch: boolean;
    q: string;
  } | null;
};

export const useMapStatus = (config: Config = defaultConfig) => {
  const { $modes, $floors, $places } = useNuxtApp();

  const status = ref<Status>({
    mode: $modes.value.filter((mode) => mode.enable)[0]?.id || "", // 有効なmodeの最初のものをデフォルトにする
    floor: $floors.value[0]?.id || "", // 最初のfloorをデフォルトにする
    place: null,
    search: null,
  });

  return {
    status: readonly(status),
  };
};

// https://maps.nishi-h.net/?mode=main,shinkan80&floor=f1&place=ground&search=and&q=校庭%20体育館
