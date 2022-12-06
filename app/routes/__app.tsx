import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { Form, Outlet } from "@remix-run/react";

function Logo(props: { className?: string }) {
  const { className } = props;

  return (
    <svg
      viewBox="0 0 47 40"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M23.5 6.5C17.5 6.5 13.75 9.5 12.25 15.5C14.5 12.5 17.125 11.375 20.125 12.125C21.8367 12.5529 23.0601 13.7947 24.4142 15.1692C26.6202 17.4084 29.1734 20 34.75 20C40.75 20 44.5 17 46 11C43.75 14 41.125 15.125 38.125 14.375C36.4133 13.9471 35.1899 12.7053 33.8357 11.3308C31.6297 9.09158 29.0766 6.5 23.5 6.5ZM12.25 20C6.25 20 2.5 23 1 29C3.25 26 5.875 24.875 8.875 25.625C10.5867 26.0529 11.8101 27.2947 13.1642 28.6693C15.3702 30.9084 17.9234 33.5 23.5 33.5C29.5 33.5 33.25 30.5 34.75 24.5C32.5 27.5 29.875 28.625 26.875 27.875C25.1633 27.4471 23.9399 26.2053 22.5858 24.8307C20.3798 22.5916 17.8266 20 12.25 20Z" />
    </svg>
  );
}

function LogoutAction() {
  return (
    <Form action="/logout" method="post">
      <button
        type="submit"
        aria-label="Sign out"
        className="rounded-full bg-gray-50 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
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
            <Logo className="h-8 w-8 shrink-0 text-indigo-600" />
            <LogoutAction />
          </div>
        </nav>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="lg:hidden">
          {/* horizontal navbar */}
          <nav className="border-b bg-gray-50">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:gap-6">
              <Logo className="h-8 w-8 shrink-0 text-indigo-600" />
              <LogoutAction />
            </div>
          </nav>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
