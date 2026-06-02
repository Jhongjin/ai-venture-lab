import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/browser-file-download.ts")).href;
const {
  buildClipboardCopyMessage,
  buildDownloadPreparedMessage,
  copyBrowserText,
  triggerBrowserDraftDownload,
  triggerBrowserTextDownload,
} = await import(moduleUrl);

assert.equal(buildClipboardCopyMessage("개발 패키지"), "개발 패키지을 클립보드에 복사했습니다.");
assert.equal(buildDownloadPreparedMessage("Cursor 연결 파일"), "Cursor 연결 파일 파일을 준비했습니다.");

let objectUrlCreated = false;
let anchorClicked = false;
const appendedElements = [];

globalThis.window = {
  URL: {
    createObjectURL() {
      objectUrlCreated = true;
      return "blob:venture-lab";
    },
    revokeObjectURL() {},
  },
  setTimeout(callback) {
    callback();
  },
};
globalThis.document = {
  body: {
    appendChild(element) {
      appendedElements.push(element);
    },
  },
  createElement() {
    return {
      click() {
        anchorClicked = true;
      },
      remove() {},
    };
  },
};
globalThis.Blob = class BrowserSmokeBlob {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
  }
};
let clipboardText = "";
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: {
    clipboard: {
      async writeText(value) {
        clipboardText = value;
      },
    },
  },
});

assert.equal(
  triggerBrowserTextDownload({
    body: "",
    fileName: "empty.md",
    mimeType: "text/markdown;charset=utf-8",
  }),
  false,
);
assert.equal(objectUrlCreated, false);
assert.equal(anchorClicked, false);

assert.equal(
  triggerBrowserTextDownload({
    body: "# Ready",
    fileName: "ready.md",
    mimeType: "text/markdown;charset=utf-8",
  }),
  true,
);
assert.equal(objectUrlCreated, true);
assert.equal(anchorClicked, true);
assert.equal(appendedElements.length, 1);
assert.equal(appendedElements[0].download, "ready.md");

assert.equal(
  triggerBrowserDraftDownload({
    body: "",
    fileName: "empty-package.md",
    label: "제작 패키지",
  }),
  null,
);
assert.equal(
  triggerBrowserDraftDownload({
    body: "# Ready",
    fileName: "venture-package.md",
    label: "제작 패키지",
  }),
  "제작 패키지 파일을 준비했습니다.",
);
assert.equal(appendedElements.length, 2);
assert.equal(appendedElements[1].download, "venture-package.md");
assert.equal(await copyBrowserText(""), false);
assert.equal(clipboardText, "");
assert.equal(await copyBrowserText("복사할 문서"), true);
assert.equal(clipboardText, "복사할 문서");

console.log("Browser file download smoke passed.");
