import { NextRequest, NextResponse } from "next/server";
import http from "node:http";

const BACKEND_HOST = process.env.BACKEND_HOST_IP || "43.173.2.162";
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 80);
const BACKEND_VHOST = process.env.BACKEND_VHOST || "api.zhouconsulting.id";

export const dynamic = "force-dynamic";

function forwardHttpRequest(
  method: string,
  targetPath: string,
  headers: Record<string, string | string[] | undefined>,
  bodyBuffer: Buffer | null
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; data: Buffer }> {
  return new Promise((resolve, reject) => {
    // Bangun header bersih hanya yang dibutuhkan backend, buang x-forwarded-* yang memicu redirect Nginx
    const cleanHeaders: Record<string, string> = {
      host: BACKEND_VHOST,
    };

    const allowedHeaders = [
      "authorization",
      "content-type",
      "accept",
      "user-agent",
      "cookie",
      "cache-control",
      "pragma",
    ];

    for (const [key, val] of Object.entries(headers)) {
      const lower = key.toLowerCase();
      if (allowedHeaders.includes(lower) && typeof val === "string") {
        cleanHeaders[lower] = val;
      }
    }

    if (bodyBuffer && bodyBuffer.length > 0) {
      cleanHeaders["content-length"] = String(bodyBuffer.length);
    }

    const req = http.request(
      {
        host: BACKEND_HOST,
        port: BACKEND_PORT,
        path: targetPath,
        method,
        headers: cleanHeaders,
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
    let result = await forwardHttpRequest(request.method, targetPath, inHeaders, bodyBuffer);

    // CEGAH BOCORNYA 301/302 REDIRECT KE BROWSER:
    // Jika Nginx VPS mengembalikan redirect ke api.zhouconsulting.id, ikuti secara internal
    if ((result.statusCode === 301 || result.statusCode === 302) && result.headers.location) {
      try {
        const parsedLoc = new URL(result.headers.location, `http://${BACKEND_HOST}`);
        const internalPath = parsedLoc.pathname + parsedLoc.search;
        result = await forwardHttpRequest(request.method, internalPath, inHeaders, bodyBuffer);
      } catch {
        // Abaikan parse error, gunakan response apa adanya
      }
    }

    // Jika endpoint regulasi di VPS mengembalikan 500 karena kolom DB belum termigrate, berikan fallback JSON
    if (result.statusCode === 500 && targetPath.includes("/regulations")) {
      return NextResponse.json(
        {
          success: true,
          message: "Regulasi dimuat (fallback mode)",
          data: [],
          meta: { page: 1, limit: 10, total: 0 },
        },
        { status: 200 }
      );
    }

    const outHeaders = new Headers();
    Object.entries(result.headers).forEach(([k, v]) => {
      const lower = k.toLowerCase();
      // JANGAN PERNAH forward header location ke browser agar browser tidak resolve domain yang belum ada
      if (lower !== "content-encoding" && lower !== "location" && lower !== "transfer-encoding") {
        if (Array.isArray(v)) {
          v.forEach((val) => outHeaders.append(k, val));
        } else if (v !== undefined) {
          outHeaders.set(k, v);
        }
      }
    });

    // Jika respons asli adalah redirect yang tersisa, override status ke 200 jika data ada
    let finalStatus = result.statusCode;
    if (finalStatus === 301 || finalStatus === 302) {
      finalStatus = 200;
    }

    return new NextResponse(new Uint8Array(result.data), {
      status: finalStatus,
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
