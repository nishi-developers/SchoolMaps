type MapMoveStatus = {
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  rotate: number;
};

type MapStatus = {
  mode: string | null;
  floor: string;
  places: readonly string[];
};

type ViewSize = {
  width: number;
  height: number;
};
