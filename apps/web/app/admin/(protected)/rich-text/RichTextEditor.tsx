"use client";

import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { BTN_SMALL, FIELD_BASE } from "../../ui";
import { contentToEditorHtml, sanitizeEditorHtml } from "@/lib/rich-text";

const TOOLBAR_BUTTON =
  "inline-flex h-8 w-8 items-center justify-center rounded-thumb text-slate-600 transition-colors duration-200 hover:bg-genbi-light hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 disabled:pointer-events-none disabled:opacity-40";

const TOOLS: Array<{
  icon: typeof Bold;
  label: string;
  command: string;
  value?: string;
}> = [
  { icon: Bold, label: "Tebal", command: "bold" },
  { icon: Italic, label: "Miring", command: "italic" },
  { icon: Underline, label: "Garis bawah", command: "underline" },
  { icon: Strikethrough, label: "Coret", command: "strikeThrough" },
  { icon: Heading2, label: "Judul besar", command: "formatBlock", value: "h2" },
  { icon: Heading3, label: "Subjudul", command: "formatBlock", value: "h3" },
  {
    icon: Quote,
    label: "Kutipan",
    command: "formatBlock",
    value: "blockquote",
  },
  { icon: List, label: "Daftar poin", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Daftar nomor", command: "insertOrderedList" },
];

const EDITOR_CLASSES =
  "min-h-[320px] rounded-thumb border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-genbi-blue focus:ring-2 focus:ring-genbi-blue/20 [&_a]:text-genbi-blue [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-genbi-haze [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-2 [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5";

/**
 * Editor teks kaya bersama untuk isi Berita dan jawaban FAQ (modul admin).
 *
 * Toolbar dasar (tebal, miring, daftar, judul, kutipan, tautan) plus tempelan
 * dari Word: gaya teks pada span (font-weight/font-style/underline) diubah
 * menjadi tag semantik, atribut dan skrip dibuang sebelum masuk editor.
 * Komponen tidak dikendalikan nilai setelah mount supaya posisi kursor tidak
 * melompat; pemanggil mengunci instance per konten lewat prop `key`.
 */
export function RichTextEditor({
  initialHtml,
  onChange,
  disabled = false,
  label = "Isi berita",
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) editor.innerHTML = contentToEditorHtml(initialHtml);
    // Sengaja hanya saat mount; instance dikunci per konten oleh pemanggil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const run = (command: string, value?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    emit();
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    run("createLink", /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`);
    setLinkOpen(false);
    setLinkUrl("");
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    if (html) {
      document.execCommand("insertHTML", false, sanitizeEditorHtml(html));
    } else {
      document.execCommand(
        "insertText",
        false,
        event.clipboardData.getData("text/plain"),
      );
    }
    emit();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-thumb border border-b-0 border-slate-300 bg-genbi-soft px-2 py-1.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run(tool.command, tool.value)}
              className={TOOLBAR_BUTTON}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </button>
          );
        })}
        <button
          type="button"
          title="Tautan"
          aria-label="Tautan"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setLinkOpen((open) => !open);
            setLinkUrl("");
          }}
          className={TOOLBAR_BUTTON}
        >
          <Link2 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          title="Hapus format"
          aria-label="Hapus format"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            run("removeFormat");
            run("formatBlock", "p");
          }}
          className={TOOLBAR_BUTTON}
        >
          <RemoveFormatting className="h-4 w-4" aria-hidden />
        </button>
        <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden />
        <button
          type="button"
          title="Batalkan"
          aria-label="Batalkan"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => run("undo")}
          className={TOOLBAR_BUTTON}
        >
          <Undo2 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          title="Ulangi"
          aria-label="Ulangi"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => run("redo")}
          className={TOOLBAR_BUTTON}
        >
          <Redo2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {linkOpen && !disabled ? (
        <div className="flex flex-wrap items-center gap-2 border-x border-slate-300 bg-white px-2 py-2">
          <input
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                insertLink();
              }
            }}
            placeholder="https://contoh.com"
            aria-label="Alamat tautan"
            className={`${FIELD_BASE} flex-1`}
          />
          <button type="button" onClick={insertLink} className={BTN_SMALL}>
            Terapkan
          </button>
          <button
            type="button"
            onClick={() => {
              setLinkOpen(false);
              setLinkUrl("");
            }}
            className={BTN_SMALL}
          >
            Batal
          </button>
        </div>
      ) : null}

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={onPaste}
        aria-label={label}
        aria-disabled={disabled}
        className={`${EDITOR_CLASSES} ${
          disabled ? "bg-slate-50 text-slate-400" : ""
        }`}
      />
    </div>
  );
}
