import { readTextFile, saveTextFile, FileOperationError } from "./lib";
import { PROJECT_PATHS } from "./config";
import { initializeSvgEnvironment, cleanupSvgString } from "./svg-utils";
import { SvgTransformer } from "./svg-transformer";
import { createModesData, createFloorsData, createBehaviorsData } from "./data-generators";

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  try {
    console.log("マップコンバーターを開始します...");

    // SVG環境の初期化
    initializeSvgEnvironment();

    // 入力ファイルの読み込み
    console.log("入力ファイルを読み込んでいます...");
    const rawSvgContent = await readTextFile(PROJECT_PATHS.input.rawMap);

    // SVGコンテンツの基本クリーンアップ
    let processedContent = cleanupSvgString(rawSvgContent);

    // SVG変換の実行
    console.log("SVGの変換を実行しています...");
    const transformer = new SvgTransformer(processedContent);
    processedContent = transformer.applyAllTransformations().getContent();

    // 変換後のSVGをクリーンアップ
    processedContent = cleanupSvgString(processedContent);

    // データ生成
    console.log("関連データを生成しています...");
    const modesData = createModesData(processedContent);
    const floorsData = createFloorsData(processedContent);
    const behaviorsData = createBehaviorsData(processedContent);

    // ファイル保存
    console.log("ファイルを保存しています...");
    await Promise.all([
      saveTextFile(PROJECT_PATHS.intermediate.map, processedContent),
      saveTextFile(PROJECT_PATHS.intermediate.modesData, JSON.stringify(modesData, null, 2)),
      saveTextFile(PROJECT_PATHS.intermediate.floorsData, JSON.stringify(floorsData, null, 2)),
      saveTextFile(PROJECT_PATHS.intermediate.behaviorsData, JSON.stringify(behaviorsData, null, 2)),
    ]);

    console.log("マップコンバーターが正常に完了しました。");
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

// コンバーターの前にやること:
// 1. Inkscapeで開く
// 2. 全選択して、Path->Object to Path
// 3. Extensions->Modify Path->Apply Transform
// 4. File->DocumentProperties->Resize to content
// 5. Export->PlaneSVG->Export
