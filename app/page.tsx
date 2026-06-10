import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to analytics as the default landing dashboard
  redirect("/analytics");
}
