import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sites = await prisma.workSite.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(sites);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, location } = body;
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const site = await prisma.workSite.create({ data: { name, location } });
  return NextResponse.json(site, { status: 201 });
}
