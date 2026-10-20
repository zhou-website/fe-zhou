import { NextRequest, NextResponse } from "next/server";
import http from "node:http";

const BACKEND_HOST = process.env.BACKEND_HOST_IP || "139.190.103.80";
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 80);
const BACKEND_VHOST = process.env.BACKEND_VHOST || "api.zhouconsulting.id";

export const dynamic = "force-dynamic";

function forwardHttpRequest(
  method: string,
  path: string,
  headers: Record<string, string | string[] | undefined>,
  bodyBuffer: Buffer | null
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; data: Buffer }> {
  return new Promise((resolve, reject) => {
    // Siapkan headers untuk backend Express di VPS
    const forwardHeaders: Record<string, string | string[] | undefined> = {
      ...headers,
      host: BACKEND_VHOST, // Pastikan Nginx mengenali VirtualHost api.zhouconsulting.id
    };

    delete forwardHeaders["connection"];
    if (bodyBuffer) {
      forwardHeaders["content-length"] = String(bodyBuffer.length);
    } else {
      delete forwardHeaders["content-length"];
    }

    const req = http.request(
      {
        host: BACKEND_HOST, // Koneksi socket TCP langsung ke IP VPS (bypasses DNS)
        port: BACKEND_PORT,
        path,
        method,
        headers: forwardHeaders,
        timeout: 15000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 200,
            headers: res.headers,
            data: Buffer.concat(chunks),
          });
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout terhubung ke server backend"));
    });

    if (bodyBuffer && bodyBuffer.length > 0) {
      req.write(bodyBuffer);
    }
    req.end();
  });
}

async function handleProxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  const pathSegment = params.path ? params.path.join("/") : "";
  const search = request.nextUrl.search;
  const targetPath = `/api/v1/${pathSegment}${search}`;

  const inHeaders: Record<string, string | string[] | undefined> = {};
  request.headers.forEach((value, key) => {
    inHeaders[key.toLowerCase()] = value;
  });

  let bodyBuffer: Buffer | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const arrayBuf = await request.arrayBuffer();
      bodyBuffer = Buffer.from(arrayBuf);
    } catch {
      bodyBuffer = null;
    }
  }

  try {
    const result = await forwardHttpRequest(request.method, targetPath, inHeaders, bodyBuffer);

    const outHeaders = new Headers();
    Object.entries(result.headers).forEach(([k, v]) => {
      if (v !== undefined && k.toLowerCase() !== "content-encoding") {
        if (Array.isArray(v)) {
          v.forEach((val) => outHeaders.append(k, val));
        } else {
          outHeaders.set(k, v);
        }
      }
    });

    return new NextResponse(new Uint8Array(result.data), {
      status: result.statusCode,
      headers: outHeaders,
    });
  } catch (err: unknown) {
    console.error(`[API Proxy Error on ${targetPath}]:`, err);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal terhubung ke backend server VPS",
        error: err instanceof Error ? err.message : "PROXY_FORWARD_ERROR",
      },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const HEAD = handleProxy;
export const OPTIONS = handleProxy;
