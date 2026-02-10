import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const centers = await prisma.sportCenter.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(centers);
}
