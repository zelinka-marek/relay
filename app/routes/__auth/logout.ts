import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout, redirectAuthedUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await redirectAuthedUser(request);

  return redirect("/");
}

export function action({ request }: ActionArgs) {
  return logout(request);
}
