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
    fontSize: string;
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
  isDatabaseIntegrated?: boolean;
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
