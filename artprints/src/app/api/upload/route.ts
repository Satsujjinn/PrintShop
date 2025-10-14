import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToBlob, validateImageFile, processImageFile } from '@/lib/blob'

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

    // Process image (optional optimization)
    const { processedFile, metadata } = await processImageFile(file)
    
    // Upload to Vercel Blob
    const uploadResult = await uploadToBlob(processedFile, processedFile.name, processedFile.type)

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        originalName: file.name,
        size: file.size,
        type: file.type,
        metadata
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
