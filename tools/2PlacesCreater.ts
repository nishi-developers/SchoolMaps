import { readTextFile, saveTextFile, FileOperationError } from "./lib";
import { PROJECT_PATHS } from "./config";
import { initializeSvgEnvironment } from "./svg-utils";
import { createPlacesDataCsv, getPlaceBehaviorIds } from "./data-generators";

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  try {
    console.log("プレイスデータ作成ツールを開始します...");

    // SVG環境の初期化
    initializeSvgEnvironment();

    // 必要なファイルの読み込み
    console.log("必要なファイルを読み込んでいます...");
    const [mapContent, behaviorsContent] = await Promise.all([
      readTextFile(PROJECT_PATHS.intermediate.map),
      readTextFile(PROJECT_PATHS.intermediate.behaviorsData),
    ]);

    // プレイス用のビヘイビアIDを取得
    console.log("プレイス用のビヘイビアを特定しています...");
    const placeBehaviorIds = getPlaceBehaviorIds(behaviorsContent);

    // プレイスデータ（CSV形式）の生成
    console.log("プレイスデータを生成しています...");
    const placesDataCsv = createPlacesDataCsv(mapContent, placeBehaviorIds);

    // ファイル保存
    console.log("ファイルを保存しています...");
    await saveTextFile(PROJECT_PATHS.intermediate.placesData, placesDataCsv);

    console.log("プレイスデータ作成が正常に完了しました。");
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
