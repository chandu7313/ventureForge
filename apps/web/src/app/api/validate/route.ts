import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const response = await fetch(`${apiUrl}/api/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userId}`, // Or proper service token
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[VALIDATE_API]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
