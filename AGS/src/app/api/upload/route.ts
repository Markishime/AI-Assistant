import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId || userId === 'null' || userId === 'undefined') {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ 
        error: `Failed to upload file to storage: ${uploadError.message}` 
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Save file metadata to database
    const { data: uploadedFile, error: dbError } = await supabase
      .from('documents')
      .insert({
        id: fileId,
        user_id: userId,
        filename: file.name,
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_path: filePath,
        storage_url: publicUrl,
        upload_status: 'completed',
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.type,
          storagePath: filePath
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to clean up the uploaded file if database save fails
      await supabase.storage.from('documents').remove([filePath]);
      return NextResponse.json({ 
        error: `Failed to save file metadata: ${dbError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      id: uploadedFile.id,
      name: uploadedFile.filename,
      size: uploadedFile.file_size,
      type: uploadedFile.file_type,
      uploadedAt: uploadedFile.created_at,
      url: publicUrl,
      storagePath: filePath
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('📋 Upload API GET - User ID:', userId);

    if (!userId || userId === 'null' || userId === 'undefined') {
      console.log('⚠️  No valid user ID provided, returning empty files array');
      return NextResponse.json({ files: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Querying documents for user:', userId);
    
    const { data: files, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ 
        error: `Failed to fetch files: ${error.message}` 
      }, { status: 500 });
    }

    console.log(`✅ Found ${files?.length || 0} files for user`);

    const formattedFiles = files?.map(file => ({
      id: file.id,
      name: file.filename,
      size: file.file_size,
      type: file.file_type,
      uploadedAt: file.created_at,
      url: file.storage_url || `/api/files/${file.id}`,
      storagePath: file.file_path
    })) || [];

    return NextResponse.json({ files: formattedFiles });

  } catch (error) {
    console.error('❌ Fetch files error:', error);
    return NextResponse.json(
      { error: `Failed to fetch files: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const userId = searchParams.get('userId');

    if (!fileId || !userId) {
      return NextResponse.json({ error: 'File ID and User ID required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First get the file info to get the storage path
    const { data: file, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
    }

    // Delete from storage
    if (file.file_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([file.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to delete file from database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
