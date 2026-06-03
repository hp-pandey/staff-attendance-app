import { redirect } from "next/navigation";
import { auth } from "@/auth";
import App from "@/components/App";

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return <App />;
}
