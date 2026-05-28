import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'project-documents';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const ext = file.name.split('.').pop() || 'pdf';
    const timestamp = Date.now();
    const path = `${bucket}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket not found')) {
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760,
        });

        if (createError && !createError.message.includes('already exists')) {
          return NextResponse.json({ error: `Failed to create bucket: ${createError.message}` }, { status: 500 });
        }

        const { data: retryData, error: retryError } = await supabase.storage
          .from(bucket)
          .upload(path, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(retryData.path);
        return NextResponse.json({ url: urlData.publicUrl });
      }

      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}