import { createSVGWindow } from "svgdom";
import { SVG, registerWindow, Element } from "@svgdotjs/svg.js";

/**
 * SVG環境を初期化する関数
 */
export function initializeSvgEnvironment(): void {
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);
}

/**
 * SVGファイルから特定の属性を持つ要素のユニークな値を抽出
 */
export function extractUniqueAttributeValues(svgContent: string, attributeName: string): Set<string> {
  const svg = SVG(svgContent);
  const values = new Set<string>();

  svg.find(`*[${attributeName}]`).forEach((element: Element) => {
    const value = element.attr(attributeName);
    if (value) {
      values.add(value);
    }
  });

  return values;
}

/**
 * SVG要素に複数の属性を一度に設定
 */
export function setMultipleAttributes(element: Element, attributes: Record<string, string | null>): void {
  Object.entries(attributes).forEach(([key, value]) => {
    element.attr(key, value);
  });
}

/**
 * SVG文字列の基本的なクリーンアップ
 */
export function cleanupSvgString(content: string): string {
  let cleaned = content;

  // XMLタグを削除
  if (cleaned.startsWith("<?xml ")) {
    const endOfXml = cleaned.indexOf("?>") + 2;
    cleaned = cleaned.slice(endOfXml).trim();
  }

  // DOCTYPEタグを削除
  if (cleaned.startsWith("<!DOCTYPE ")) {
    const endOfXml = cleaned.indexOf(">") + 1;
    cleaned = cleaned.slice(endOfXml).trim();
  }

  // 連続する空白行を削除
  cleaned = cleaned.replace(/\s*\n\s*/g, "\n");

  return cleaned;
}
