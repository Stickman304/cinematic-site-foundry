import { NextRequest, NextResponse } from "next/server";
import { createClientRecord, listClientRecords } from "@/lib/supabase";
import { toSlug, uniqueSlug } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET() {
  const clients = await listClientRecords();
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name?: string;
    businessType?: string;
    websiteUrl?: string;
    brandNotes?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontPreference?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const baseSlug = toSlug(body.name);
  // Use uniqueSlug to guarantee no collision
  const slug = uniqueSlug(baseSlug);

  const client = await createClientRecord({
    slug,
    name: body.name.trim(),
    businessType: body.businessType,
    websiteUrl: body.websiteUrl,
    brandNotes: body.brandNotes,
    primaryColor: body.primaryColor,
    secondaryColor: body.secondaryColor,
    fontPreference: body.fontPreference,
    contactName: body.contactName,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone,
    notes: body.notes,
  });

  if (!client) {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }

  return NextResponse.json({ client }, { status: 201 });
}
