export type SearchIndex = [
  {
    id: string;
    contents: Array<string>;
  }
];
export type FloorInfo = [
  {
    shortName: string;
    fullName: string;
    mapWidth: number;
    mapHeight: number;
  }
];
export type PlaceInfo = {
  [key: string]: {
    floor: number;
    layer: string;
    name: string;
    words: string;
    desc: string;
    images: Array<string> | [];
  };
};
export type Layers = [
  {
    prefix: string;
    place: boolean;
    switchable: boolean;
    name: string;
    style: any;
  }
];
