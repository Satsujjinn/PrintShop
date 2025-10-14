import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToS3, generateFileKey, validateImageFile } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Generate unique key for the file
    const key = generateFileKey(file.name)
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to S3
    const uploadResult = await uploadToS3(buffer, key, file.type)
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
