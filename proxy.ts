import { NextRequest, NextResponse } from "next/server";
import { hasProjectOwnerCredentials } from "./lib/server/owner-access";

export function proxy(request: NextRequest) {
  if (hasProjectOwnerCredentials(request.headers)) {
    return NextResponse.next();
  }

  return new NextResponse("Autenticação necessária.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="EFD Clara - área administrativa"',
      "Cache-Control": "private, no-store",
    },
  });
}

export const config = {
  matcher: ["/admin/configurar/:path*", "/api/admin/setup/:path*"],
};
