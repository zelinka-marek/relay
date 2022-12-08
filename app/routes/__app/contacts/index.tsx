import { CursorArrowRaysIcon } from "@heroicons/react/24/outline";

export default function ContactsIndexRoute() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <CursorArrowRaysIcon className="h-6 w-6 text-gray-400" />
        </div>
        <h1 className="mt-2 text-sm font-medium text-gray-500">
          Select a contact
        </h1>
      </div>
    </div>
  );
}
