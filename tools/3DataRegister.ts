import { readTextFile, saveTextFile, FileOperationError } from "./lib";
import { PROJECT_PATHS } from "./config";
import { convertCsvToPlaces } from "./data-generators";

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  try {
    console.log("データ登録ツールを開始します...");

    // 中間ファイルの読み込み
    console.log("中間ファイルを読み込んでいます...");
    const [mapContent, placesContent, modesContent, floorsContent, behaviorsContent] = await Promise.all([
      readTextFile(PROJECT_PATHS.intermediate.map),
      readTextFile(PROJECT_PATHS.intermediate.placesData),
      readTextFile(PROJECT_PATHS.intermediate.modesData),
      readTextFile(PROJECT_PATHS.intermediate.floorsData),
      readTextFile(PROJECT_PATHS.intermediate.behaviorsData),
    ]);

    // プレイスデータをCSVからJSONに変換
    console.log("プレイスデータを変換しています...");
    const placesData = convertCsvToPlaces(placesContent);

    // 出力ファイルに保存
    console.log("最終ファイルを保存しています...");
    await Promise.all([
      saveTextFile(PROJECT_PATHS.output.map, mapContent, true),
      saveTextFile(PROJECT_PATHS.output.placesData, JSON.stringify(placesData, null, 2), true),
      saveTextFile(PROJECT_PATHS.output.modesData, modesContent, true),
      saveTextFile(PROJECT_PATHS.output.floorsData, floorsContent, true),
      saveTextFile(PROJECT_PATHS.output.behaviorsData, behaviorsContent, true),
    ]);

    console.log("データ登録が正常に完了しました。");
  } catch (error) {
    if (error instanceof FileOperationError) {
      console.error(`ファイル操作エラー: ${error.message}`);
      console.error(`ファイルパス: ${error.filePath}`);
      console.error(`操作: ${error.operation}`);
    } else {
      console.error(`予期しないエラーが発生しました: ${error}`);
    }
    process.exit(1);
  }
}

// プログラム実行
if (require.main === module) {
  main();
}

export { main };
