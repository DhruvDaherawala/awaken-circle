import { v2 as cloudinary } from 'cloudinary';

// Validate and read credentials from environment variables
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (!isCloudinaryConfigured) {
  console.warn(
    "⚠️ Cloudinary credentials are not fully configured in your environment variables. " +
    "Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
  );
}

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Always return secure HTTPS URLs
});

/**
 * Generic upload function supporting multiple file input formats.
 * 
 * Supports:
 * - Local file path (string)
 * - Base64 Data URL (string, e.g. "data:image/png;base64,...")
 * - Node.js Buffer
 * - HTML5 File / Blob object (standard in Next.js Server Actions / Request Form Data)
 * 
 * @param {string|Buffer|File|Blob} file - The file content/reference to upload
 * @param {object} options - Cloudinary upload config overrides (e.g. folder, public_id, transformation)
 * @returns {Promise<{success: boolean, secure_url: string, public_id: string, width: number, height: number, format: string, resource_type: string, bytes: number}>}
 */
export async function uploadImage(file, options = {}) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured. Please check your environment variables.");
  }

  // Merge default settings (auto resource detection)
  const uploadOptions = {
    resource_type: 'auto',
    ...options,
  };

  try {
    // 1. Handle file representation as a string (file path, remote URL, or base64 data URI)
    if (typeof file === 'string') {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return {
        success: true,
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
      };
    }

    // 2. Handle File/Blob objects (common in Next.js App Router API Routes / Server Actions)
    let bufferToUpload = file;
    if (file && typeof file.arrayBuffer === 'function') {
      const arrayBuffer = await file.arrayBuffer();
      bufferToUpload = Buffer.from(arrayBuffer);
    }

    // 3. Handle Node.js Buffer (either direct or converted from File/Blob)
    if (Buffer.isBuffer(bufferToUpload)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload_stream failure:", error);
              return reject(new Error(`Cloudinary upload failed: ${error.message}`));
            }
            resolve({
              success: true,
              secure_url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes,
            });
          }
        );
        // Write the buffer to the writable Cloudinary stream
        uploadStream.end(bufferToUpload);
      });
    }

    throw new Error("Unsupported file format provided to uploadImage helper. Must be filepath string, base64, Buffer, or File/Blob.");
  } catch (error) {
    console.error("Cloudinary upload exception details:", error);
    throw error;
  }
}

/**
 * Deletes an image from Cloudinary using its public_id.
 * 
 * @param {string} publicId - The public ID of the image on Cloudinary (e.g. "awaken-circle/events/covers/my-event_cover_12345")
 * @param {object} options - Cloudinary destroy overrides (e.g. invalidate caches)
 * @returns {Promise<{success: boolean, result: string, message?: string}>}
 */
export async function deleteImage(publicId, options = {}) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured. Please check your environment variables.");
  }

  if (!publicId) {
    throw new Error("A public_id is required to delete an image.");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true, // Invalidate CDN cached versions of the deleted asset
      ...options
    });

    if (result.result === 'ok') {
      return {
        success: true,
        result: result.result
      };
    } else {
      // Cloudinary returns { result: 'not_found' } if the ID does not exist
      return {
        success: false,
        result: result.result,
        message: `Cloudinary returned status: ${result.result}`
      };
    }
  } catch (error) {
    console.error("Cloudinary delete exception details:", error);
    throw error;
  }
}

/**
 * Extracts the Cloudinary public_id from a secure_url or standard Cloudinary HTTP URL.
 * Supports parsing complex paths with custom folders and subfolders.
 * 
 * @param {string} url - The complete Cloudinary asset URL
 * @returns {string|null} The parsed public_id, or null if parsing fails or URL is not a Cloudinary asset
 */
export function extractPublicId(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return null;
  }
  
  try {
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    
    // Remove version segment (e.g. "v1714578945/") if present
    let path = parts[1];
    const pathSegments = path.split('/');
    if (pathSegments[0] && pathSegments[0].startsWith('v') && /^\d+$/.test(pathSegments[0].substring(1))) {
      pathSegments.shift(); // remove the version segment
      path = pathSegments.join('/');
    }
    
    // Remove the file extension (e.g. ".jpg", ".png", ".webp")
    const lastDot = path.lastIndexOf('.');
    if (lastDot !== -1) {
      path = path.substring(0, lastDot);
    }
    
    return path;
  } catch (error) {
    console.error("Failed to parse public_id from URL:", error);
    return null;
  }
}


/**
 * Specialized helper to upload an event cover image.
 * Auto-limits dimensions, converts to modern formats (AVIF/WebP), and compresses automatically for premium SEO and page load speeds.
 * 
 * @param {string|Buffer|File|Blob} file - The image file reference
 * @param {string} eventSlug - The slug of the event to build an SEO-friendly public_id
 * @returns {Promise<{success: boolean, secure_url: string, public_id: string, width: number, height: number, format: string, resource_type: string, bytes: number}>}
 */
export async function uploadEventCover(file, eventSlug = 'event') {
  const sanitizedSlug = eventSlug
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-');
  
  const timestamp = Date.now();
  const publicId = `${sanitizedSlug}_cover_${timestamp}`;
  
  return uploadImage(file, {
    folder: 'awaken-circle/events/covers',
    public_id: publicId,
    overwrite: true,
    // Production-ready responsive transformations:
    // Limit large images to standard aspect ratio limits, auto format to WebP/AVIF, auto quality compression
    transformation: [
      { width: 1200, height: 630, crop: 'limit' }, 
      { fetch_format: 'auto', quality: 'auto' }
    ]
  });
}

/**
 * Specialized helper to upload gallery images.
 * Limits extreme resolutions to 1600px width while keeping natural aspect ratios.
 * 
 * @param {string|Buffer|File|Blob} file - The image file reference
 * @param {string} associationSlug - Identifier (event slug or community slug) to cluster search results and SEO terms
 * @returns {Promise<{success: boolean, secure_url: string, public_id: string, width: number, height: number, format: string, resource_type: string, bytes: number}>}
 */
export async function uploadGalleryImage(file, associationSlug = 'general') {
  const sanitizedSlug = associationSlug
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-');
  
  const timestamp = Date.now();
  const publicId = `${sanitizedSlug}_gallery_${timestamp}`;

  return uploadImage(file, {
    folder: 'awaken-circle/gallery',
    public_id: publicId,
    transformation: [
      { width: 1600, crop: 'limit' }, 
      { fetch_format: 'auto', quality: 'auto' }
    ]
  });
}

/**
 * Specialized helper to upload community assets like logos or cover banners.
 * 
 * @param {string|Buffer|File|Blob} file - The image file reference
 * @param {string} communitySlug - The community identifier
 * @param {'logo'|'cover'} assetType - 'logo' (square face-gravity crop) or 'cover' (banner aspect ratio)
 * @returns {Promise<{success: boolean, secure_url: string, public_id: string, width: number, height: number, format: string, resource_type: string, bytes: number}>}
 */
export async function uploadCommunityAsset(file, communitySlug, assetType = 'cover') {
  const sanitizedSlug = communitySlug
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-');
  
  const timestamp = Date.now();
  const publicId = `${sanitizedSlug}_${assetType}_${timestamp}`;
  const folder = `awaken-circle/communities/${assetType}s`;
  
  const transformation = assetType === 'logo' 
    ? [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }, { fetch_format: 'auto', quality: 'auto' }]
    : [{ width: 1400, height: 600, crop: 'limit' }, { fetch_format: 'auto', quality: 'auto' }];

  return uploadImage(file, {
    folder,
    public_id: publicId,
    overwrite: true,
    transformation
  });
}

// Export the base cloudinary instance for advanced low-level operations
export { cloudinary };
export default uploadImage;
