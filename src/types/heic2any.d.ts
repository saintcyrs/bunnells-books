declare module 'heic2any' {
  /**
   * Convert HEIC/HEIF images to another format.
   * The library’s default export is a function that returns a Promise resolving to a Blob (or ArrayBuffer in older versions).
   * We keep the type broad (`any`) for options so your app compiles; refine this later if you need stricter types.
   */
  interface Heic2AnyOptions {
    /**
     * The HEIC/HEIF data – typically a File from an <input> element or a Blob fetched from the network.
     */
    blob: Blob | File | ArrayBuffer;
    /**
     * Target mime-type. Defaults to 'image/jpeg'.
     */
    toType?: 'image/jpeg' | 'image/png' | 'image/webp';
    /**
     * JPEG / WEBP quality from 0-1. Ignored for PNG.
     */
    quality?: number;
  }

  const convert: (options: Heic2AnyOptions) => Promise<Blob>;
  export default convert;
}
