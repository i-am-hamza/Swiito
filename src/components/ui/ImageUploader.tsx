"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ImagePlus, X, Star, GripVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/format";

export interface UploadedPhoto {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
}

interface InternalPhoto extends UploadedPhoto {
  uploading: boolean;
  progress: number;
  error: string | null;
  localUrl: string | null;
}

interface ImageUploaderProps {
  propertyId: string;
  supabaseUrl: string;
  anonKey: string;
  initial?: UploadedPhoto[];
  onChange?: (photos: UploadedPhoto[]) => void;
  onPhotoAdded?: (photo: UploadedPhoto) => void;
  onPhotoDeleted?: (photoId: string) => void;
  onCoverChanged?: (photoId: string) => void;
  onReordered?: (photos: { id: string; sortOrder: number }[]) => void;
  maxFiles?: number;
  className?: string;
}

const BUCKET = "property-photos";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_LONG_EDGE = 1920;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<Blob> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");
  if (isHeic) return file;

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > MAX_LONG_EDGE || h > MAX_LONG_EDGE) {
        if (w >= h) {
          h = Math.round((h * MAX_LONG_EDGE) / w);
          w = MAX_LONG_EDGE;
        } else {
          w = Math.round((w * MAX_LONG_EDGE) / h);
          h = MAX_LONG_EDGE;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

async function uploadWithProgress(
  supabaseUrl: string,
  anonKey: string,
  accessToken: string,
  propertyId: string,
  blob: Blob,
  onProgress: (pct: number) => void
): Promise<{ url: string; error: string | null }> {
  const ext = blob.type === "image/jpeg" ? "jpg" : "png";
  const path = `${propertyId}/${Math.random().toString(36).slice(2)}.${ext}`;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("Content-Type", blob.type || "image/jpeg");
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
        resolve({ url: publicUrl, error: null });
      } else {
        resolve({ url: "", error: `Upload failed (${xhr.status})` });
      }
    };
    xhr.onerror = () => resolve({ url: "", error: "Network error during upload" });
    xhr.send(blob);
  });
}

export function ImageUploader({
  propertyId,
  supabaseUrl,
  anonKey,
  initial = [],
  onChange,
  onPhotoAdded,
  onPhotoDeleted,
  onCoverChanged,
  onReordered,
  maxFiles = 20,
  className,
}: ImageUploaderProps) {
  const inputId = useId();
  const [photos, setPhotos] = useState<InternalPhoto[]>(() =>
    initial.map((p) => ({ ...p, uploading: false, progress: 100, error: null, localUrl: null }))
  );
  const [dragOver, setDragOver] = useState(false);
  const dragSrcIdx = useRef<number | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");

  const getToken = useCallback(async (): Promise<string> => {
    if (accessToken) return accessToken;
    const { createClient } = await import("@/lib/supabase/browser");
    const sb = createClient();
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token ?? anonKey;
    setAccessToken(token);
    return token;
  }, [accessToken, anonKey]);

  const toUploaded = (p: InternalPhoto): UploadedPhoto => ({
    id: p.id,
    url: p.url,
    isCover: p.isCover,
    sortOrder: p.sortOrder,
  });

  const notify = (next: InternalPhoto[]) => {
    onChange?.(next.filter((p) => !p.uploading && !p.error).map(toUploaded));
  };

  async function processFiles(files: FileList | File[]) {
    const arr = Array.from(files).slice(0, maxFiles - photos.length);
    if (!arr.length) return;

    const token = await getToken();

    const placeholders: InternalPhoto[] = arr.map((f, i) => ({
      id: `tmp-${Date.now()}-${i}`,
      url: "",
      isCover: photos.length === 0 && i === 0,
      sortOrder: photos.length + i,
      uploading: true,
      progress: 0,
      error: null,
      localUrl: URL.createObjectURL(f),
    }));

    setPhotos((prev) => [...prev, ...placeholders]);

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      const tmpId = placeholders[i].id;

      if (file.size > MAX_SIZE_BYTES) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === tmpId ? { ...p, uploading: false, error: "File exceeds 10 MB" } : p
          )
        );
        continue;
      }

      const blob = await compressImage(file);

      const { url, error } = await uploadWithProgress(
        supabaseUrl,
        anonKey,
        token,
        propertyId,
        blob,
        (pct) => {
          setPhotos((prev) =>
            prev.map((p) => (p.id === tmpId ? { ...p, progress: pct } : p))
          );
        }
      );

      if (error || !url) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === tmpId ? { ...p, uploading: false, error: error ?? "Upload failed" } : p
          )
        );
        continue;
      }

      const realId = `${Date.now()}-${i}`;
      const finalPhoto: InternalPhoto = {
        id: realId,
        url,
        isCover: placeholders[i].isCover,
        sortOrder: placeholders[i].sortOrder,
        uploading: false,
        progress: 100,
        error: null,
        localUrl: null,
      };

      setPhotos((prev) => {
        const next = prev.map((p) => (p.id === tmpId ? finalPhoto : p));
        notify(next);
        return next;
      });

      onPhotoAdded?.(toUploaded(finalPhoto));
    }
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }

  function setAsCover(id: string) {
    setPhotos((prev) => {
      const next = prev.map((p) => ({ ...p, isCover: p.id === id }));
      notify(next);
      return next;
    });
    onCoverChanged?.(id);
  }

  function remove(id: string) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed?.localUrl) URL.revokeObjectURL(removed.localUrl);
      const next = prev
        .filter((p) => p.id !== id)
        .map((p, i) => ({ ...p, sortOrder: i }));
      // If removed was cover, make first photo cover
      if (removed?.isCover && next.length > 0) next[0].isCover = true;
      notify(next);
      return next;
    });
    onPhotoDeleted?.(id);
  }

  // HTML5 drag-to-reorder
  function onDragStart(e: React.DragEvent, idx: number) {
    dragSrcIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOverItem(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragSrcIdx.current === null || dragSrcIdx.current === idx) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragSrcIdx.current!, 1);
      next.splice(idx, 0, moved);
      dragSrcIdx.current = idx;
      return next.map((p, i) => ({ ...p, sortOrder: i }));
    });
  }

  function onDragEnd() {
    dragSrcIdx.current = null;
    setPhotos((prev) => {
      onReordered?.(prev.map((p) => ({ id: p.id, sortOrder: p.sortOrder })));
      return prev;
    });
  }

  const canAdd = photos.length < maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      {canAdd && (
        <label
          htmlFor={inputId}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-3 h-40 rounded-xl border-2 border-dashed cursor-pointer transition-brand",
            dragOver
              ? "border-accent bg-accent/5"
              : "border-[var(--border)] hover:border-accent/50 bg-surface-2"
          )}
        >
          <ImagePlus size={28} className="text-fg-muted" aria-hidden="true" />
          <div className="text-center">
            <p className="text-sm font-medium text-fg">Drop photos here or click to select</p>
            <p className="text-xs text-fg-muted mt-0.5">JPG, PNG, HEIC · up to 10 MB each</p>
          </div>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
            multiple
            className="sr-only"
            onChange={handleFiles}
          />
        </label>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, idx) => {
            const src = photo.localUrl ?? photo.url;
            return (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => onDragStart(e, idx)}
                onDragOver={(e) => onDragOverItem(e, idx)}
                onDragEnd={onDragEnd}
                className={cn(
                  "relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-2 group border",
                  photo.isCover ? "border-accent" : "border-[var(--border)]"
                )}
              >
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    aria-hidden="true"
                  />
                )}

                {/* Upload progress overlay */}
                {photo.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                    <Loader2 size={20} className="text-white animate-spin" />
                    <span className="text-white text-xs font-medium">{photo.progress}%</span>
                    <div className="w-3/4 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${photo.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {photo.error && (
                  <div className="absolute inset-0 bg-danger/80 flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center leading-tight">{photo.error}</p>
                  </div>
                )}

                {/* Actions (visible on hover unless uploading) */}
                {!photo.uploading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-brand">
                    {/* Drag handle */}
                    <div className="absolute top-1 left-1 text-white opacity-0 group-hover:opacity-70 cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} />
                    </div>

                    {/* Cover badge / set cover button */}
                    {!photo.error && (
                      <button
                        type="button"
                        onClick={() => setAsCover(photo.id)}
                        title={photo.isCover ? "Cover photo" : "Set as cover"}
                        className={cn(
                          "absolute bottom-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium transition-brand",
                          photo.isCover
                            ? "bg-accent text-on-accent opacity-100"
                            : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <Star size={10} fill={photo.isCover ? "currentColor" : "none"} />
                        {photo.isCover ? "Cover" : "Set cover"}
                      </button>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => remove(photo.id)}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-brand hover:bg-danger"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-fg-muted">
        {photos.filter((p) => !p.uploading && !p.error).length} / {maxFiles} photos
        {photos.length >= 5 ? "" : ` — ${5 - photos.filter((p) => !p.error).length} more required`}
      </p>
    </div>
  );
}
