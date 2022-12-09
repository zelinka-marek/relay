import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { Form, Outlet } from "@remix-run/react";
import { Logo } from "~/components/logo";

function LogoutAction() {
  return (
    <Form action="/logout" method="post">
      <button
        type="submit"
        aria-label="Sign out"
        className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        <ArrowRightOnRectangleIcon className="h-6 w-6" />
      </button>
    </Form>
  );
}

export default function AppRoute() {
  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="hidden lg:flex lg:shrink-0 lg:flex-col">
        {/* vertical navbar */}
        <nav className="flex flex-1 flex-col bg-gray-800">
          <div className="flex w-16 flex-1 flex-col items-center justify-between gap-4 py-4 md:gap-6">
            <Logo className="h-8 w-8 shrink-0 text-indigo-500" />
            <LogoutAction />
          </div>
        </nav>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="lg:hidden">
          {/* horizontal navbar */}
          <nav className="bg-gray-800">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:gap-6">
              <Logo className="h-8 w-8 shrink-0 text-indigo-500" />
              <LogoutAction />
            </div>
          </nav>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
