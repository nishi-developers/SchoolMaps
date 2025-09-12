export function shareLink(title: string, url: string) {
  try {
    navigator.share({ title, url });
  } catch {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert("リンクをコピーしました");
    } else {
      alert("リンクのコピー及び共有に対応していません");
    }
  }
}
