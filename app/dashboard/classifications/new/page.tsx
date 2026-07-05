import { redirect } from "next/navigation";

/** The wizard moved to /classify (works for guests and signed-in users). */
export default function NewClassificationRedirect() {
  redirect("/classify");
}
