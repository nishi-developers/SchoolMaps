// 型定義ファイル

export interface Mode {
  id: string;
  enable: boolean;
  name: string;
  always: boolean;
  image: string;
}

export interface Floor {
  id: string;
  name: string;
  always: boolean;
}

export interface BehaviorStyle {
  body: {
    fillDefault: {
      light: string;
      dark: string;
    };
    fillSelect: {
      light: string;
      dark: string;
    } | null;
    stroke: {
      light: string;
      dark: string;
    };
    strokeWidth: number;
  };
  label: {
    fill: {
      light: string;
      dark: string;
    };
    fontMaxSize: string;
  } | null;
}

export interface Behavior {
  id: string;
  isPlace: boolean;
  style: BehaviorStyle | null;
}

export interface Detail {
  mapVersion: string;
  width: number;
  height: number;
  infoProviders: string[];
}

export interface Place {
  id: string;
  mode: string;
  floor: string;
  behavior: string;
  name: string;
  words: string;
  desc: string;
  images: string[];
}

export interface ProjectPaths {
  readonly input: {
    readonly rawMap: string;
  };
  readonly intermediate: {
    readonly map: string;
    readonly placesData: string;
    readonly modesData: string;
    readonly floorsData: string;
    readonly behaviorsData: string;
    readonly detailData: string;
  };
  readonly output: {
    readonly map: string;
    readonly placesData: string;
    readonly modesData: string;
    readonly floorsData: string;
    readonly behaviorsData: string;
    readonly detailData: string;
  };
}
