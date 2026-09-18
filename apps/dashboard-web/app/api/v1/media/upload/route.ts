import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const shopId = req.nextUrl.searchParams.get('shopId') || 'general';

    if (!file) {
      return NextResponse.json({ success: false, message: 'الملف مطلوب' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename & create unique name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;

    // Target upload directory in public/uploads/<shopId>
    const uploadsDir = join(process.cwd(), 'public', 'uploads', shopId);
    await mkdir(uploadsDir, { recursive: true });

    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${shopId}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      data: {
        url: publicUrl,
        filename,
        size: file.size,
        type: file.type,
      },
    });
  } catch (err: any) {
    console.error('Media upload error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'فشل رفع الملف' },
      { status: 500 }
    );
  }
}

