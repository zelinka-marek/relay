import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { Form, Outlet } from "@remix-run/react";
import { Logo } from "~/components/logo";

function LogoutAction() {
  return (
    <Form action="/logout" method="post">
      <button
        type="submit"
        aria-label="Sign out"
        className="rounded-full bg-gray-50 p-1 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
      >
        <ArrowRightOnRectangleIcon className="h-6 w-6" />
      </button>
    </Form>
  );
}

export default function AppRoute() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="hidden lg:flex lg:shrink-0 lg:flex-col">
        {/* vertical navbar */}
        <nav className="flex flex-1 flex-col border-r bg-gray-50">
          <div className="flex w-16 flex-1 flex-col items-center justify-between gap-4 py-4 md:gap-6">
            <Logo className="h-8 w-8 shrink-0 text-primary-600" />
            <LogoutAction />
          </div>
        </nav>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="lg:hidden">
          {/* horizontal navbar */}
          <nav className="border-b bg-gray-50">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:gap-6">
              <Logo className="h-8 w-8 shrink-0 text-primary-600" />
              <LogoutAction />
            </div>
          </nav>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
