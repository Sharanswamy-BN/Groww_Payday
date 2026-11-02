import { cookies } from "next/headers";

export async function getUserId() {
  const store = await cookies();
  return store.get("payday_user")?.value ?? null;
}

export async function getSipId() {
  const store = await cookies();
  return store.get("payday_sip")?.value ?? null;
}

export async function setSipCookie(sipId: string) {
  const store = await cookies();
  store.set("payday_sip", sipId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
