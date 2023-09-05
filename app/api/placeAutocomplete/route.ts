import { NextRequest, NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const searchParams = request.nextUrl.searchParams;
  searchParams.set("key", process.env.GOOGLE_MAP_API_KEY || "");
  searchParams.set("radius", "20000");

  const res = await fetch(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json?" +
      searchParams.toString()
  );
  const data = await res.json();

  return NextResponse.json({ data });
}
