/**
 * Kustaro operator (admin) allowlist. These accounts can see the cross-org
 * feedback console and receive feedback notification emails. Everyone else gets
 * a 404 on the admin routes.
 *
 * Defaults to the two co-founders; override with the ADMIN_EMAILS env var
 * (comma-separated) if the operator set ever changes — no redeploy of this file
 * needed, just the env var.
 */
const DEFAULT_ADMIN_EMAILS = [
  "deniz@terra-reform.org",
  "mahmut@kustaro.app",
];

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const list = fromEnv.length ? fromEnv : DEFAULT_ADMIN_EMAILS;
  return list.map((e) => e.toLowerCase());
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
