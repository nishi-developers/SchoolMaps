export const usePropertyDesc = (place: Ref<Place>, requestURL: URL, emitApplyUrl: () => void) => {
  // 説明の初期化処理
  // jump
  // [校庭](grand)というように囲まれた部分をリンクとして扱う
  // bold
  // **bold**というように囲まれた部分を太字として扱う
  // new line
  // /nという文字列を改行として扱う

  const description = ref("");
  const jumpUrls = ref<Array<string>>([]);

  const initDesc = () => {
    jumpUrls.value = [];
    if (!place.value) return;
    description.value = place.value.desc;
    description.value = description.value.replace(/<br>|\\n/g, "<br>"); // 基本は<br>を改行として扱う(このコードは予備)
    description.value = description.value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    description.value = description.value.replace(/\[(.+?)\]\((.+?)\)/g, (match, name, url) => {
      jumpUrls.value.push(url);
      return `<a id="jumpUrl-${jumpUrls.value.length - 1}" href="${url}">${name}</a>`;
    });
  };

  const registerJumpLinkEvents = () => {
    jumpUrls.value.forEach((url, index) => {
      const el = document.getElementById(`jumpUrl-${index}`);
      if (el) {
        el.addEventListener("click", async (e) => {
          e.preventDefault();
          const urlOnj = new URL(url, requestURL.origin);
          if (urlOnj.origin == requestURL.origin) {
            // 内部リンク
            await navigateTo(url);
            if (urlOnj.pathname == "/" || urlOnj.pathname == "/index") {
              // map(index)の場合
              emitApplyUrl();
            }
          } else {
            // 外部リンク
            window.open(url, "_blank", "noopener");
          }
        });
      }
    });
  };

  return {
    description,
    initDesc,
    registerJumpLinkEvents,
  };
};
