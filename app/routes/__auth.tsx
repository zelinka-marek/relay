import { Outlet } from "@remix-run/react";

export default function AuthRoute() {
  return (
    <div className="flex min-h-full flex-col justify-center bg-gray-50 py-12">
      <Outlet />
    </div>
  );
}
