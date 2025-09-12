import { SVG, Element } from "@svgdotjs/svg.js";
import { setMultipleAttributes } from "./svg-utils";

/**
 * SVG変換用のクラス
 */
export class SvgTransformer {
  private svgContent: string;

  constructor(initialContent: string) {
    this.svgContent = initialContent;
  }

  /**
   * 現在のSVGコンテンツを取得
   */
  getContent(): string {
    return this.svgContent;
  }

  /**
   * Inkscapeラベルの置換
   */
  replaceInkscapeLabels(): this {
    this.svgContent = this.svgContent.replace("inkscape:label=", "inkscape-label=");
    this.svgContent = this.svgContent.replace(/inkscape:[a-zA-Z-]+="[^"]*"/g, "");
    return this;
  }

  /**
   * Affinity属性の削除
   */
  deleteAffinityAttributes(): this {
    this.svgContent = this.svgContent.replace(/serif:[a-zA-Z-]+="[^"]*"/g, "");
    return this;
  }

  /**
   * defsタグの削除
   */
  deleteDefs(): this {
    // 自己終了タグと通常のタグの両方に対応
    // 複数のdefsタグが存在する場合も対応
    this.svgContent = this.svgContent.replace(/<defs[^>]*\/>/g, ""); // 自己終了タグ
    this.svgContent = this.svgContent.replace(/<defs[^>]*>[\s\S]*?<\/defs>/g, ""); // 通常のタグ

    return this;
  }

  /**
   * inkscape-labelをidに変換
   */
  convertInkscapeLabelToId(): this {
    const svg = SVG(this.svgContent);
    svg.find("*[inkscape-label]").forEach((element: Element) => {
      const label = element.attr("inkscape-label");
      if (label) {
        setMultipleAttributes(element, {
          id: label,
          "inkscape-label": null,
        });
      }
    });
    this.svgContent = svg.svg();
    return this;
  }

  /**
   * _で始まるidの要素を削除
   */
  deleteElementsWithUnderscoreIds(): this {
    const svg = SVG(this.svgContent);
    svg.find("[id^='_']").forEach((element: Element) => {
      element.remove();
    });
    this.svgContent = svg.svg();
    return this;
  }

  /**
   * idの_以降を削除
   */
  trimIdsAfterUnderscore(): this {
    const svg = SVG(this.svgContent);
    svg.find("[id]").forEach((element: Element) => {
      const id = element.attr("id");
      if (id && id.includes("_")) {
        const newId = id.split("_")[0];
        element.attr("id", newId);
      }
    });
    this.svgContent = svg.svg();
    return this;
  }

  /**
   * Affinity用のg要素の処理
   */
  processAffinityGroups(): this {
    const svg = SVG(this.svgContent);
    svg.find("g").forEach((gElement) => {
      const children = gElement.children();
      if (children.length === 1 && children[0].type !== "g") {
        const child = children[0];
        const id = gElement.attr("id");
        const transform = gElement.attr("transform");

        // id重複防止のため、g要素のidを削除
        gElement.attr("id", undefined);

        setMultipleAttributes(child, {
          id: id,
          transform: transform,
        });

        gElement.parent()!.add(child);
        gElement.remove();
      }
    });
    this.svgContent = svg.svg();
    return this;
  }

  /**
   * g要素を削除し、属性を設定
   */
  flattenGroupsAndSetAttributes(): this {
    const svg = SVG(this.svgContent);

    svg.find("*:not(g)").forEach((element: Element) => {
      const target = element.parent()?.parent()?.parent()?.parent();
      const mode = element.parent()?.parent()?.parent()?.attr("id");
      const floor = element.parent()?.parent()?.attr("id");
      const behavior = element.parent()?.attr("id");

      setMultipleAttributes(element, {
        mode: mode,
        floor: floor,
        behavior: behavior,
      });

      target?.add(element);
    });

    svg.find("g").forEach((element: Element) => {
      element.remove();
    });

    this.svgContent = svg.svg();
    return this;
  }

  /**
   * place属性の設定
   */
  setPlaceAttributes(): this {
    const svg = SVG(this.svgContent);
    svg.find("*:not(g)").forEach((element: Element) => {
      const id = element.attr("id");
      setMultipleAttributes(element, {
        id: null,
        place: id,
      });
    });
    this.svgContent = svg.svg();
    return this;
  }

  /**
   * style属性を削除
   */
  deleteStyleAttributes(): this {
    const svg = SVG(this.svgContent);
    svg.find("[style]").forEach((element: Element) => {
      element.attr("style", null);
    });
    this.svgContent = svg.svg();
    return this;
  }

  /**
   * 全ての変換を一度に実行
   */
  applyAllTransformations(): this {
    return this.replaceInkscapeLabels()
      .deleteAffinityAttributes()
      .deleteDefs()
      .convertInkscapeLabelToId()
      .deleteElementsWithUnderscoreIds()
      .trimIdsAfterUnderscore()
      .processAffinityGroups()
      .flattenGroupsAndSetAttributes()
      .setPlaceAttributes()
      .deleteStyleAttributes();
  }
}
