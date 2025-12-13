import { redirect } from "next/navigation";

// Server-side redirect to login - users must authenticate first
export default function HomePage() {
  redirect("/login");
}
