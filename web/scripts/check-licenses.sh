#!/bin/bash
# MITライセンス互換性チェックスクリプト
# このスクリプトは依存パッケージのライセンスをチェックし、MITライセンスと互換性があるかを確認します

set -e

echo "======================================"
echo "MITライセンス互換性チェック"
echo "======================================"
echo ""

# 依存パッケージがインストールされているか確認
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modulesが見つかりません。npm installを実行してください。"
    exit 1
fi

echo "📊 ライセンスサマリを生成中..."
echo ""

# license-checkerを実行
npx license-checker --summary

echo ""
echo "======================================"
echo "✅ チェック完了"
echo "======================================"
echo ""
echo "詳細な情報が必要な場合は、以下のコマンドを実行してください："
echo "  npx license-checker --json > licenses.json"
echo ""
echo "MITと互換性のないライセンスが見つかった場合は、"
echo "そのパッケージの使用を再検討するか、代替パッケージを探してください。"
