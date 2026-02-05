import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // PumpPortal expects an array of transaction args
    const txArgs = Array.isArray(body) ? body : [body];

    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(txArgs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PumpPortal error:", response.status, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to create transaction" },
        { status: response.status }
      );
    }

    // Response is JSON array of base58-encoded transactions
    const encodedTransactions = await response.json();
    
    return NextResponse.json(encodedTransactions, {
      status: 200,
    });
  } catch (error: any) {
    console.error("Create proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Transaction creation failed" },
      { status: 500 }
    );
  }
}
