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
    fill_default: {
      light: string;
      dark: string;
    };
    fill_select: {
      light: string;
      dark: string;
    };
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
    fontSize: string;
  };
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
