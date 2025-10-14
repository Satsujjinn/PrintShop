import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

// Upload file to S3
export async function uploadToS3(file: Buffer, key: string, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make images publicly accessible
    })

    await s3Client.send(command)
    
    // Return the public URL
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    return { success: true, url, key }
  } catch (error) {
    console.error('Error uploading to S3:', error)
    return { success: false, error }
  }
}

// Delete file from S3
export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return { success: true }
  } catch (error) {
    console.error('Error deleting from S3:', error)
    return { success: false, error }
  }
}

// Get signed URL for upload (for client-side uploads)
export async function getSignedUploadUrl(key: string, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    
    return { success: true, signedUrl, publicUrl, key }
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return { success: false, error }
  }
}

// Generate unique file key
export function generateFileKey(originalName: string, prefix = 'artworks') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `${prefix}/${timestamp}-${random}.${extension}`
}

// Validate file type
export function validateImageFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 10MB.' }
  }

  return { valid: true }
}
