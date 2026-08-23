import { clearAdminSession, setAdminSession, verifySubmittedSecret } from "@/lib/server/billingAdmin";

export async function POST(request: Request) {
  let payload: { secret?: string } = {};
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (!verifySubmittedSecret(payload.secret ?? "")) {
    return Response.json(
      { success: false, message: "Admin secret is invalid." },
      { status: 401 },
    );
  }

  await setAdminSession();
  return Response.json({ success: true });
}

export async function DELETE() {
  await clearAdminSession();
  return Response.json({ success: true });
}
