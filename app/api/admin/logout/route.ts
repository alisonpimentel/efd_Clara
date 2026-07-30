import { clearAdminSession } from "../../../../lib/server/admin-auth";

export async function POST(request: Request) {
  await clearAdminSession();
  return Response.redirect(new URL("/admin/login", request.url), 303);
}
