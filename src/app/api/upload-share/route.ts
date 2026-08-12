import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Requires `BLOB_READ_WRITE_TOKEN` in the environment.
 * Created automatically when a Blob store is attached to the Vercel project.
 * Before this works in prod: `vercel blob store add` (or attach a store in the
 * Vercel dashboard). Locally it fails without a token unless you run
 * `vercel env pull`.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing PNG file. Send the exported graphic as `file`." },
        { status: 400 },
      );
    }

    const named = file instanceof File ? file.name : "";
    const isPng =
      file.type === "image/png" || named.toLowerCase().endsWith(".png");
    if (!isPng) {
      return NextResponse.json(
        { error: "That file isn't a PNG. Export the graphic again and retry." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error:
            "That graphic is over 8MB. Download it instead and post it to X manually.",
        },
        { status: 400 },
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Share upload isn't configured yet. Add a Vercel Blob store (`vercel blob store add`) and pull env vars (`vercel env pull`), or just download the PNG and post it manually.",
        },
        { status: 500 },
      );
    }

    const blob = await put(`shares/${crypto.randomUUID()}.png`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/png",
    });

    let ogUrl: string | undefined;
    const ogFile = form.get("og");
    if (ogFile instanceof Blob) {
      const ogNamed = ogFile instanceof File ? ogFile.name : "";
      const ogIsPng =
        ogFile.type === "image/png" || ogNamed.toLowerCase().endsWith(".png");
      if (ogIsPng && ogFile.size <= MAX_BYTES) {
        const ogBlob = await put(`shares/${crypto.randomUUID()}-og.png`, ogFile, {
          access: "public",
          addRandomSuffix: false,
          contentType: "image/png",
        });
        ogUrl = ogBlob.url;
      }
    }

    return NextResponse.json({ url: blob.url, ogUrl });
  } catch (caught) {
    const message =
      caught instanceof Error && caught.message
        ? caught.message
        : "Couldn't upload that graphic to share storage.";
    return NextResponse.json(
      {
        error: `${message} Download the PNG and post it to X manually if this keeps happening.`,
      },
      { status: 500 },
    );
  }
}
