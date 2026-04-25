import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ streak: 5, xp: 820, badges: ["focus-sprinter"] });
}
