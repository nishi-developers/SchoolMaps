export class Search {
  PlaceInfo: PlaceInfo = {};
  FloorInfo: FloorInfo = [] as unknown as FloorInfo;
  Layers: Layers = [] as unknown as Layers;
  SearchIndex: SearchIndex = [] as unknown as SearchIndex;
  targets = ["id", "name", "words", "desc", "floorFullName", "floorShortName", "layer"] as const;

  async initialize() {
    const [placeInfo, floorInfo, layers] = await Promise.all([
      import("@/assets/PlaceInfo.json"),
      import("@/assets/FloorInfo.json"),
      import("@/assets/Layers.json"),
    ]);
    this.PlaceInfo = placeInfo.default as PlaceInfo;
    this.FloorInfo = floorInfo.default as FloorInfo;
    this.Layers = layers.default as Layers;
    for (const key of Object.keys(this.PlaceInfo)) {
      const floor = this.PlaceInfo[key]?.floor;
      const normalizeContent = (content: string | null | undefined) => {
        if (typeof content !== "string") return "";
        return this.#normalize(content);
      };
      this.SearchIndex.push({
        id: key,
        name: normalizeContent(this.PlaceInfo[key]?.name),
        words: normalizeContent(this.PlaceInfo[key]?.words),
        desc: normalizeContent(this.PlaceInfo[key]?.desc),
        floorFullName: normalizeContent(floor ? this.FloorInfo[floor]?.fullName : ""),
        floorShortName: normalizeContent(floor ? this.FloorInfo[floor]?.shortName : ""),
        layer: normalizeContent(floor ? this.PlaceInfo[key]?.layer : ""),
      });
    }
  }

  search(rawQuery: string | null, isAndSearch: boolean = false): Array<string> {
    if (!rawQuery) {
      rawQuery = ""; // 空文字列やnullの場合は全ての結果を返す
    }
    const querys = this.#normalize(rawQuery).split(" ");
    const results: Array<string> = [];
    for (const query of querys) {
      const ids = this.#searchByOneQuery(query);
      if (!isAndSearch) {
        // OR検索
        ids.forEach((id) => {
          if (!results.includes(id)) {
            results.push(id);
          }
        });
      } else {
        // AND検索
        if (results.length === 0) {
          results.push(...ids);
        } else {
          // 既存の結果と新しい結果の積集合を取る
          const newResults = results.filter((id) => ids.includes(id));
          results.length = 0; // 結果をクリア
          results.push(...newResults);
        }
      }
    }
    return results;
  }

  #searchByOneQuery(query: string): Array<string> {
    const results: Array<string> = [];
    const { prefix, parsedQuery } = this.#parseQuery(query);
    if (parsedQuery === "") {
      // クエリが空の場合は全てのIDを返す
      return this.SearchIndex.map((index) => index.id);
    }
    for (const target of this.targets) {
      if (prefix === null || prefix === target) {
        this.SearchIndex.forEach((index) => {
          if (index[target].includes(parsedQuery)) {
            results.push(index.id);
          }
        });
      }
    }
    return results;
  }

  #parseQuery(query: string): { prefix: string | null; parsedQuery: string } {
    for (const target of this.targets) {
      if (query.startsWith(`${target}:`)) {
        return {
          prefix: target,
          parsedQuery: query.slice(target.length + 1),
        };
      }
    }
    // プレフィックスがない場合は、全てのフィールドを対象にする
    return {
      prefix: null,
      parsedQuery: query,
    };
  }

  // 正規化(大文字->小文字、全角->半角、カタカナ->ひらがな、全角スペース->半角スペース)
  #normalize(str: string): string {
    // カタカナ->ひらがな変換
    const kataToHira = (str: string) => {
      return str.replace(/[\u30a1-\u30f6]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0x60);
      });
    };
    // 全角->半角変換
    const zenToHan = (str: string) => {
      return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      });
    };
    return zenToHan(kataToHira(str))?.toLowerCase().replace(/　/g, " ");
  }
}
