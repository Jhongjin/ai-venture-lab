export type BrowserTextDownloadOptions = {
  body: string;
  fileName: string;
  mimeType: string;
};

export type BrowserDraftDownloadOptions = {
  body: string;
  fileName: string;
  label: string;
  mimeType?: string;
};

export type BrowserSetupFileDraft = {
  path: string;
  body: string;
};

export function buildClipboardCopyMessage(label: string) {
  return `${label}을 클립보드에 복사했습니다.`;
}

export function buildDownloadPreparedMessage(label: string) {
  return `${label} 파일을 준비했습니다.`;
}

export function triggerBrowserTextDownload({ body, fileName, mimeType }: BrowserTextDownloadOptions) {
  if (!body) {
    return false;
  }

  const url = window.URL.createObjectURL(new Blob([body], { type: mimeType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);

  return true;
}

export function triggerBrowserMarkdownDownload(body: string, fileName: string) {
  return triggerBrowserTextDownload({
    body,
    fileName,
    mimeType: "text/markdown;charset=utf-8",
  });
}

export function triggerBrowserDraftDownload({
  body,
  fileName,
  label,
  mimeType = "text/markdown;charset=utf-8",
}: BrowserDraftDownloadOptions) {
  if (!triggerBrowserTextDownload({ body, fileName, mimeType })) {
    return null;
  }

  return buildDownloadPreparedMessage(label);
}

export function encodeBrowserUtf8Base64(body: string) {
  const bytes = new TextEncoder().encode(body);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  return window.btoa(binary);
}

export function encodeBrowserSetupFiles(files: BrowserSetupFileDraft[]) {
  return files.map((file) => ({ path: file.path, base64: encodeBrowserUtf8Base64(file.body) }));
}
