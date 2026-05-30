import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';
import { uploadEventCover, uploadGalleryImage, uploadImage } from '@/lib/cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

async function handler(request) {
  // 1. Authenticate administrative session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
    return errorResponse("Unauthorized: Admin privileges required.", 401);
  }

  // 2. Parse Multipart Form Data
  const formData = await request.formData();
  const file = formData.get('file');
  const type = formData.get('type') || 'general'; // 'cover', 'gallery', or 'general'
  const slug = formData.get('slug') || 'unassigned';

  // 3. Validation
  if (!file) {
    return errorResponse("No file provided in the request upload field.", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("File size exceeds the 5MB safety limit.", 400);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return errorResponse(`Unsupported file format (${file.type}). Please upload JPEG, PNG, WEBP, or HEIC.`, 400);
  }

  // 4. Perform upload using specialized helper based on asset type
  let uploadResult;
  try {
    if (type === 'cover') {
      uploadResult = await uploadEventCover(file, slug);
    } else if (type === 'gallery') {
      uploadResult = await uploadGalleryImage(file, slug);
    } else {
      uploadResult = await uploadImage(file, {
        folder: 'awaken-circle/general',
      });
    }
  } catch (uploadError) {
    console.error("Cloudinary execution failed:", uploadError);
    return errorResponse(`Media storage server failure: ${uploadError.message}`, 502);
  }

  return successResponse(
    {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
    },
    "Asset uploaded and optimized successfully.",
    201
  );
}

export const POST = withErrorHandler(handler);
