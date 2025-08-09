"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTextFile = readTextFile;
exports.readTextFileAsync = readTextFileAsync;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
// テキストファイルを読み込んでconsole.logする関数
function readTextFile(filePath) {
    try {
        // ファイルが存在するかチェック
        if (!(0, fs_1.existsSync)(filePath)) {
            console.error(`エラー: ファイルが見つかりません: ${filePath}`);
            return;
        }
        // ファイルを同期的に読み込み
        const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
        console.log(`=== ファイル内容: ${filePath} ===`);
        console.log(content);
        console.log(`=== 読み込み完了 ===`);
    }
    catch (error) {
        console.error(`ファイル読み込みエラー: ${error}`);
    }
}
// 非同期版の関数
async function readTextFileAsync(filePath) {
    try {
        // ファイルが存在するかチェック
        if (!(0, fs_1.existsSync)(filePath)) {
            console.error(`エラー: ファイルが見つかりません: ${filePath}`);
            return;
        }
        // ファイルを非同期で読み込み
        const content = await (0, promises_1.readFile)(filePath, 'utf-8');
        console.log(`=== ファイル内容 (非同期): ${filePath} ===`);
        console.log(content);
        console.log(`=== 読み込み完了 ===`);
    }
    catch (error) {
        console.error(`ファイル読み込みエラー: ${error}`);
    }
}
// メイン実行部分
function main() {
    // コマンドライン引数からファイルパスを取得
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('使用方法: npm run start <ファイルパス>');
        console.log('例: npm run start ../README.md');
        // デモ用にREADME.mdを読み込んでみる
        const demoFile = (0, path_1.join)(__dirname, '..', 'README.md');
        console.log('\nデモ: README.mdを読み込みます...');
        readTextFile(demoFile);
        return;
    }
    const filePath = args[0];
    const resolvedPath = (0, path_1.resolve)(filePath);
    console.log(`ファイルパス: ${resolvedPath}`);
    // 同期版で読み込み
    readTextFile(resolvedPath);
    // 非同期版でも読み込み（デモ用）
    console.log('\n--- 非同期版でも読み込み ---');
    readTextFileAsync(resolvedPath);
}
// スクリプトが直接実行された場合のみmainを呼び出し
if (require.main === module) {
    main();
}
