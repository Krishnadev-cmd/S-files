import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BucketAdmin from "@/app/components/BucketAdmin";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <BucketAdmin />
    </div>
  );
}
