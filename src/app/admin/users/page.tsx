import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireStaff();
  const users = await prisma.user.findMany({ select: { email: true, role: true, stateCode: true, active: true } });
  return (
    <section>
      <h1 className="font-display text-3xl">Users</h1>
      <table className="mt-4 w-full text-left"><thead><tr><th>Email</th><th>Role</th><th>State</th></tr></thead>
      <tbody>{users.map((u) => <tr key={u.email}><td>{u.email}</td><td>{u.role}</td><td>{u.stateCode ?? "—"}</td></tr>)}</tbody></table>
    </section>
  );
}
