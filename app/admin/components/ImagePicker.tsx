"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type StorageFile = {
  name: string;
  url: string;
  size: number;
  created_at: string;
};

type Tab = "library" | "upload" | "url";

type Props = {
  value: string;              // current image_url in the form
  onChange: (url: string) => void;
};

type UploadResponse = {
  url?: string;
  error?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uploadProductImage(
  file: File,
  onProgress: (progress: number) => void
) {
  return new Promise<UploadResponse>((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.upload.onload = () => onProgress(100);

    xhr.onload = () => {
      let json: UploadResponse = {};
      try {
        json = JSON.parse(xhr.responseText || "{}");
      } catch {
        reject(new Error("Upload failed"));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(json.error ?? "Upload failed"));
        return;
      }

      resolve(json);
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    xhr.open("POST", "/api/admin/products/upload");
    xhr.send(fd);
  });
}

// ---------------------------------------------------------------------------
// ImagePicker
// ---------------------------------------------------------------------------
export default function ImagePicker({ value, onChange }: Props) {
  const [tab, setTab] = useState<Tab>("library");
  const [open, setOpen] = useState(false);

  // Library state
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libError, setLibError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // URL state
  const [urlInput, setUrlInput] = useState("");

  // ── Fetch library ────────────────────────────────────────────────────────
  const fetchLibrary = useCallback(async () => {
    setLibLoading(true);
    setLibError(null);
    try {
      const res = await fetch("/api/admin/storage");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFiles(await res.json());
    } catch (e) {
      setLibError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLibLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && tab === "library") fetchLibrary();
  }, [open, tab, fetchLibrary]);

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      const json = await uploadProductImage(file, setUploadProgress);
      if (!json.url) throw new Error(json.error ?? "Upload failed");
      onChange(json.url);
      setOpen(false);
      // Refresh library next time it opens
      setFiles([]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ── Select from library ──────────────────────────────────────────────────
  const confirmLibrary = () => {
    if (selected) {
      onChange(selected);
      setOpen(false);
      setSelected(null);
    }
  };

  // ── Confirm URL ──────────────────────────────────────────────────────────
  const confirmUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setUrlInput("");
      setOpen(false);
    }
  };

  // ---------------------------------------------------------------------------
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300">
        Product Image
      </label>

      {/* Trigger row */}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-gold-400/40 hover:text-gold-400"
        >
          {value ? "Change image" : "Choose image"}
        </button>

        {value && (
          <div className="relative">
            <img
              src={value}
              alt="Selected"
              className="h-14 w-14 rounded-2xl object-cover border border-white/10"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400 hover:bg-red-500 hover:text-white transition"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-zinc-500">
        Pick from storage · upload file · or paste a URL
      </p>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl flex flex-col max-h-[85dvh]">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
                  Image picker
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Choose a product image
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
              >
                Close
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-3 border-b border-white/10 shrink-0">
              {(["library", "upload", "url"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition ${
                    tab === t
                      ? "bg-gold-400 text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t === "library" ? "📁 Storage library" : t === "upload" ? "⬆ Upload file" : "🔗 Paste URL"}
                </button>
              ))}
            </div>

            {/* Tab bodies */}
            <div className="overflow-y-auto flex-1 p-5">

              {/* ── LIBRARY ── */}
              {tab === "library" && (
                <div>
                  {libLoading ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square animate-pulse rounded-2xl bg-zinc-800"
                        />
                      ))}
                    </div>
                  ) : libError ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                      {libError}{" "}
                      <button onClick={fetchLibrary} className="underline">
                        Retry
                      </button>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-zinc-500 text-sm">
                        No images in storage yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => setTab("upload")}
                        className="mt-3 text-sm text-gold-400 underline"
                      >
                        Upload your first image →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {files.map((f) => (
                          <button
                            key={f.name}
                            type="button"
                            onClick={() =>
                              setSelected(selected === f.url ? null : f.url)
                            }
                            className={`group relative aspect-square overflow-hidden rounded-2xl border-2 transition ${
                              selected === f.url
                                ? "border-gold-400 shadow-[0_0_0_2px_rgba(212,175,55,0.3)]"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <img
                              src={f.url}
                              alt={f.name}
                              className="h-full w-full object-cover transition group-hover:scale-105 duration-300"
                            />
                            {selected === f.url && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gold-400/20">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-zinc-950">
                                  ✓
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/80 px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                              <p className="truncate text-[10px] text-zinc-300">
                                {f.name}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {formatBytes(f.size)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-zinc-500">
                          {files.length} image{files.length !== 1 ? "s" : ""} in storage
                        </p>
                        <button
                          type="button"
                          onClick={fetchLibrary}
                          className="text-xs text-gold-400 underline"
                        >
                          Refresh
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── UPLOAD ── */}
              {tab === "upload" && (
                <div className="space-y-4">
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/20 bg-zinc-950/40 p-10 transition hover:border-gold-400/40 ${
                      uploading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    <span className="text-3xl">⬆</span>
                    <span className="text-sm font-semibold text-zinc-200">
                      {uploading ? "Uploading…" : "Click to choose a file"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Any image format · max 5 MB · auto-converted to WebP
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                      }}
                    />
                  </label>

                  {uploadError && (
                    <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                      {uploadError}
                    </p>
                  )}

                  {uploading && (
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-zinc-300">
                          {uploadProgress >= 100
                            ? "Processing image…"
                            : "Uploading to server…"}
                        </span>
                        <span className="text-sm font-semibold text-gold-400">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div
                        className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={uploadProgress}
                        aria-label="Product image upload progress"
                      >
                        <div
                          className="h-full rounded-full bg-gold-400 transition-[width] duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── URL ── */}
              {tab === "url" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmUrl()}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    />
                  </div>

                  {urlInput && (
                    <div>
                      <p className="mb-2 text-xs text-zinc-500">Preview</p>
                      <img
                        src={urlInput}
                        alt="URL preview"
                        className="h-40 w-full rounded-2xl object-contain border border-white/10 bg-zinc-950"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display = "none")
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="shrink-0 flex justify-end gap-3 border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/30 hover:text-white"
              >
                Cancel
              </button>

              {tab === "library" && (
                <button
                  type="button"
                  onClick={confirmLibrary}
                  disabled={!selected}
                  className="rounded-full bg-gold-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Use selected
                </button>
              )}

              {tab === "url" && (
                <button
                  type="button"
                  onClick={confirmUrl}
                  disabled={!urlInput.trim()}
                  className="rounded-full bg-gold-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Use this URL
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
