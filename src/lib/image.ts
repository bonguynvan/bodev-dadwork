/**
 * Client-side image handling for local-first uploads.
 * Reads a user-picked File, downscales it on a canvas, and returns a compact
 * data URL suitable for localStorage. The image never leaves the browser.
 */

const MAX_INPUT_BYTES = 15 * 1024 * 1024; // reject absurd inputs before decoding

interface Loaded {
  img: CanvasImageSource;
  w: number;
  h: number;
  done: () => void;
}

async function loadBitmap(file: File): Promise<Loaded> {
  if (typeof createImageBitmap === 'function') {
    try {
      // `from-image` applies EXIF orientation so portrait phone photos aren't sideways
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      return { img: bmp, w: bmp.width, h: bmp.height, done: () => bmp.close() };
    } catch {
      /* fall back to <img> below */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Không đọc được ảnh'));
      el.src = url;
    });
    return { img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/**
 * Compress an image File to a data URL whose longest edge is at most `maxSize`px.
 * Prefers WebP, falls back to JPEG. Throws a user-friendly Error on bad input.
 */
export async function compressImage(file: File, maxSize: number, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Vui lòng chọn một tệp ảnh');
  if (file.size > MAX_INPUT_BYTES) throw new Error('Ảnh quá lớn (tối đa 15MB)');

  const { img, w, h, done } = await loadBitmap(file);
  try {
    const scale = Math.min(1, maxSize / Math.max(w, h));
    const dw = Math.max(1, Math.round(w * scale));
    const dh = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Trình duyệt không hỗ trợ xử lý ảnh');
    ctx.drawImage(img, 0, 0, dw, dh);

    let url = canvas.toDataURL('image/webp', quality);
    if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/jpeg', quality);
    return url;
  } finally {
    done();
  }
}
