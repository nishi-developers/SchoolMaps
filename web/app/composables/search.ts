type SearchIndexItem = {
  id: string;
  name: string;
  words: string;
  desc: string;
  mode: string;
  floor: string;
  behavior: string;
  modeName: string;
  floorName: string;
};

export const useSearch = () => {
  const targets = ["id", "name", "words", "desc", "mode", "floor", "behavior", "modeName", "floorName"] as const;
  const { $modes, $floors, $places } = useNuxtApp();

  // const searchIndex: SearchIndex = [] as unknown as SearchIndex;
  const searchIndex = computed<SearchIndexItem[]>(() => {
    const index: SearchIndexItem[] = [];
    for (const place of $places.value) {
      const normalizeContent = (content: string | null | undefined) => {
        if (typeof content !== "string") return "";
        return normalize(content);
      };

      // modesのenableがtrueのものだけを対象にする
      if ($modes.value.find((mode) => mode.id === place.mode)?.enable !== true) continue;

      index.push({
        id: normalizeContent(place.id),
        name: normalizeContent(place.name),
        words: normalizeContent(place.words),
        desc: normalizeContent(place.desc),
        mode: normalizeContent(place.mode),
        floor: normalizeContent(place.floor),
        behavior: normalizeContent(place.behavior),
        modeName: normalizeContent($modes.value.find((mode) => mode.id === place.mode)?.name),
        floorName: normalizeContent($floors.value.find((floor) => floor.id === place.floor)?.name),
      });
    }
    return index;
  });

  const search = (rawQuery: string | null, isAndSearch: boolean = false): Array<string> => {
    if (!rawQuery) {
      rawQuery = ""; // 空文字列やnullの場合は全ての結果を返す
    }
    const querys = normalize(rawQuery).split(" ");
    const results: Array<string> = [];
    for (const query of querys) {
      const ids = searchByOneQuery(query);
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
  };

  const searchByOneQuery = (query: string): Array<string> => {
    const results: Array<string> = [];
    const { prefix, parsedQuery } = parseQuery(query);
    if (parsedQuery === "") {
      // クエリが空の場合は全てのIDを返す
      return searchIndex.value.map((index) => index.id);
    }
    for (const target of targets) {
      if (prefix === null || prefix === target) {
        searchIndex.value.forEach((index) => {
          if (index[target].includes(parsedQuery)) {
            results.push(index.id);
          }
        });
      }
    }
    return results;
  };

  const parseQuery = (query: string): { prefix: string | null; parsedQuery: string } => {
    for (const target of targets) {
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
  };

  // 正規化(大文字->小文字、全角->半角、カタカナ->ひらがな、全角スペース->半角スペース)
  const normalize = (str: string): string => {
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
  };

  return { search };
};
