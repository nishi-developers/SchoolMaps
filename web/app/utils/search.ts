export class SearchUtils {
  PlaceInfo: PlaceInfo = {};
  FloorInfo: FloorInfo = [] as unknown as FloorInfo;
  Layers: Layers = [] as unknown as Layers;
  SearchIndex: SearchIndex = [] as unknown as SearchIndex;
  constructor() {
    this.initialize();
  }
  async initialize() {
    this.PlaceInfo = (await import("@/assets/PlaceInfo.json")).default as PlaceInfo;
    this.FloorInfo = (await import("@/assets/FloorInfo.json")).default as FloorInfo;
    this.Layers = (await import("@/assets/Layers.json")).default as Layers;

    for (const key of Object.keys(this.PlaceInfo)) {
      const floor = this.PlaceInfo[key]?.floor;
      this.SearchIndex.push({
        id: key,
        contents: [
          this.PlaceInfo[key]?.name,
          this.PlaceInfo[key]?.words,
          key,
          this.PlaceInfo[key]?.desc,
          floor ? this.FloorInfo[floor]?.fullName : "",
          floor ? this.FloorInfo[floor]?.shortName : "",
        ].map((content) => {
          if (typeof content !== "string") return "";
          return this.#normalize(content);
        }),
      });
    }
    console.log(this.SearchIndex);
  }

  // カタカナ->ひらがな変換
  #kataToHira(str: string) {
    return str.replace(/[\u30a1-\u30f6]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0x60);
    });
  }

  // 全角->半角変換
  #zenToHan(str: string) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
  }

  // 正規化(大文字->小文字、全角->半角、カタカナ->ひらがな、全角スペース->半角スペース)
  #normalize(str: string) {
    return this.#zenToHan(this.#kataToHira(str))?.toLowerCase().replace(/　/g, " ");
  }
}
