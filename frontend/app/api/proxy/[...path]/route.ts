import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  return handleRequest(req, params);
}

export async function POST(req: NextRequest, { params }: { params: any }) {
  return handleRequest(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  return handleRequest(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  return handleRequest(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  return handleRequest(req, params);
}

async function handleRequest(req: NextRequest, paramsPromise: any) {
  // Await params to support Next.js 15+ async params, while remaining compatible with older versions
  const params = await paramsPromise;
  const path: string[] = params?.path || [];

  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  const apiKey = process.env.API_KEY || "default_api_key_change_me";

  // Reconstruct the request path and query parameters
  const pathStr = path.join("/");
  const searchParams = req.nextUrl.search;
  const targetUrl = `${backendUrl}/${pathStr}${searchParams}`;

  const method = req.method;

  // Clone headers and strip client-specific headers that might cause host mismatch

  const headers = new Headers();
  req.headers.forEach((val, key) => {
    if (!["host", "connection", "accept-encoding", "content-length", "origin", "referer"].includes(key.toLowerCase())) {
      headers.set(key, val);
    }
  });

  // Inject the server-side API Key
  headers.set("X-API-Key", apiKey);

  // Read request body if applicable
  let body: any = undefined;
  if (!["GET", "HEAD"].includes(method)) {
    try {
      body = await req.arrayBuffer();
    } catch (e) {
      // Request has no body or reading failed
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const responseData = await response.arrayBuffer();

    // Forward response headers, skipping content-encoding since we read the raw body
    const resHeaders = new Headers();
    response.headers.forEach((val, key) => {
      if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
        resHeaders.set(key, val);
      }
    });

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error(`[API Proxy Error] Failed to proxy to ${targetUrl}:`, error);
    return NextResponse.json(
      { detail: `Failed to connect to backend: ${error.message || error}` },
      { status: 502 }
    );
  }
}
