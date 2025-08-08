import { auth } from "@/auth";

export async function getUserDetails() {
  const session = await auth();

  return {
    name: session?.user?.name ?? 'User',
    image: session?.user?.image ?? null,
    email: session?.user?.email ?? 'No email provided',
    id: session?.user?.id ?? 'No ID provided',
  };
}