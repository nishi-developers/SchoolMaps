"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTextFile = readTextFile;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fast_xml_parser_1 = require("fast-xml-parser");
// ファイルを非同期で読み込む関数
async function readTextFile(filePath) {
    try {
        // ファイルが存在するかチェック
        if (!(0, fs_1.existsSync)(filePath)) {
            console.error(`エラー: ファイルが見つかりません: ${filePath}`);
            return;
        }
        // ファイルを非同期で読み込み
        const content = await (0, promises_1.readFile)(filePath, "utf-8");
        return content;
    }
    catch (error) {
        console.error(`ファイル読み込みエラー: ${error}`);
    }
}
// ファイルを保存する関数
async function saveTextFile(filePath, content) {
    try {
        // ファイルを非同期で書き込み
        await (0, promises_1.writeFile)(filePath, content, "utf-8");
        console.log(`ファイルが保存されました: ${filePath}`);
    }
    catch (error) {
        console.error(`ファイル保存エラー: ${error}`);
    }
}
// メイン実行部分
async function main() {
    // コマンドライン引数からファイルパスを取得
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("使用方法: npm run start <ファイルパス>");
        console.log("例: npm run start ../README.md");
        return;
    }
    const filePath = args[0];
    const resolvedPath = (0, path_1.resolve)(filePath);
    const file = await readTextFile(resolvedPath);
    if (!file) {
        return;
    }
    // XMLパーサーの設定
    const xmlOptions = {
        ignoreDeclaration: true,
        ignoreAttributes: false,
    };
    const xmlParser = new fast_xml_parser_1.XMLParser(xmlOptions);
    const xmlBuilder = new fast_xml_parser_1.XMLBuilder(xmlOptions);
    const jsonObj = xmlParser.parse(file);
    // 配列だろうとオブジェクトだろうと、'@_id': '_baseImg'を持つ要素を削除
    const cleanJson = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(cleanJson);
        }
        else if (typeof obj === "object" && obj !== null) {
            // オブジェクトのキーをフィルタリング
            return Object.fromEntries(Object.entries(obj)
                .filter(([key, value]) => key !== "@_id" || !value.startsWith("_"))
                .map(([key, value]) => [key, cleanJson(value)]) // 再帰的にクリーンアップ
            );
        }
        return obj; // 基本型はそのまま返す
    };
    const cleanedJson = cleanJson(jsonObj["svg"]);
    const xmlOutput = xmlBuilder.build(cleanedJson);
    const outputFilePath = "./output.xml";
    await saveTextFile(outputFilePath, xmlOutput);
}
// スクリプトが直接実行された場合のみmainを呼び出し
if (require.main === module) {
    main();
}
