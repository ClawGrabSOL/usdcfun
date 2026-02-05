import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("IPFS error:", errorText);
      return NextResponse.json(
        { error: "Failed to upload to IPFS" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("IPFS proxy error:", error);
    return NextResponse.json(
      { error: error.message || "IPFS upload failed" },
      { status: 500 }
    );
  }
}
