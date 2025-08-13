import { ProjectPaths } from "./types";

// プロジェクトのパス設定
export const PROJECT_PATHS: ProjectPaths = {
  input: {
    rawMap: "/maps/map-raw.svg",
  },
  intermediate: {
    map: "/maps/map.svg",
    placesData: "/maps/places.csv",
    modesData: "/maps/modes.json",
    floorsData: "/maps/floors.json",
    behaviorsData: "/maps/behaviors.json",
    detailData: "/maps/detail.json",
  },
  output: {
    map: "/web/server/assets/map.svg",
    placesData: "/web/server/assets/places.json",
    modesData: "/web/server/assets/modes.json",
    floorsData: "/web/server/assets/floors.json",
    behaviorsData: "/web/server/assets/behaviors.json",
    detailData: "/web/server/assets/detail.json",
  },
} as const;

// デフォルトのスタイル設定
export const DEFAULT_BEHAVIOR_STYLE = {
  body: {
    fill_default: {
      light: "",
      dark: "",
    },
    fill_select: {
      light: "",
      dark: "",
    },
    stroke: {
      light: "",
      dark: "",
    },
    strokeWidth: 2.0,
  },
  label: {
    fill: {
      light: "",
      dark: "",
    },
    fontSize: "2rem",
  },
} as const;
