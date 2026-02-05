import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { stackServerApp } from "@/stack-server";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise<NextResponse>((resolve) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: 'expenses' },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        resolve(NextResponse.json({ error: 'Upload failed' }, { status: 500 }));
                    } else {
                        resolve(NextResponse.json({ url: result?.secure_url }));
                    }
                }
            ).end(buffer);
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
