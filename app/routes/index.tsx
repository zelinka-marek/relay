import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Logo } from "~/components/logo";
import { redirectAuthedUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await redirectAuthedUser(request, "/contacts");

  return json(null);
}

export default function IndexRoute() {
  return (
    <div className="flex min-h-full flex-col justify-center bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl space-y-8 px-4 text-center sm:px-6 lg:px-8">
        <Logo className="inline-block h-12 w-auto text-primary-600" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="block">A better way to</span>
          <span className="block">manage your connections</span>
        </h1>
        <div className="space-x-4">
          <Link
            to="/join"
            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            Sign up
            <ArrowRightIcon className="-mr-0.5 h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            Sign in
            <ArrowRightIcon className="-mr-0.5 h-4 w-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
