"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTextFile = readTextFile;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const svgdom_1 = require("svgdom");
const svg_js_1 = require("@svgdotjs/svg.js");
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
    const window = (0, svgdom_1.createSVGWindow)();
    const document = window.document;
    (0, svg_js_1.registerWindow)(window, document);
    const svg = (0, svg_js_1.SVG)(file);
    // SVGの内容を編集
    // idが_で始まる要素を削除
    svg.find("[id^='_']").forEach((element) => {
        element.remove();
    });
    // affinity用:gの下にg以外が存在する場合、gのidを子要素に移す
    svg.find("g").forEach((gElement) => {
        const children = gElement.children();
        if (children.length == 1 && children[0].type != "g") {
            const child = children[0]; // 対象の子要素
            const id = gElement.attr("id"); // g要素のidを取得
            gElement.attr("id", undefined); // id重複防止の為、g要素のidを削除
            child.attr("id", id); // gのidを子要素に設定
            gElement.parent().add(child); // gの親にgの子要素を追加
            gElement.remove(); // g要素を削除
        }
    });
    // 現在のファイルはidの重複(gのidとpathのid)があるため、治す!
    // const xmlOutput = xmlBuilder.build(cleanedJson);
    const outputFilePath = "./output.xml";
    await saveTextFile(outputFilePath, svg.svg());
}
// スクリプトが直接実行された場合のみmainを呼び出し
if (require.main === module) {
    main();
}
