/**
 * Local id generator. Produces sortable, collision-resistant string ids
 * (timestamp prefix + random suffix). Good enough for on-device rows; when
 * Supabase sync lands these can be swapped for server-issued UUIDs.
 */
export function generateId(prefix = "id"): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}${rand}`;
}

/** Local user id placeholder until auth is added. */
export const LOCAL_USER_ID = "local-user";
