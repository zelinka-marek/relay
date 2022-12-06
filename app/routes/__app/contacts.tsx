import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import {
  Form,
  NavLink,
  Outlet,
  useSearchParams,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import classNames from "clsx";
import { useSpinDelay } from "spin-delay";

function SearchAction() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? undefined;

  const transition = useTransition();
  const searching = new URLSearchParams(transition.location?.search).has("q");
  const shouldRenderSpinner = useSpinDelay(searching, {
    delay: 150,
    minDuration: 500,
  });

  const submit = useSubmit();

  return (
    <Form role="search" className="w-full max-w-lg md:max-w-xs">
      <div className="relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {shouldRenderSpinner ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5" />
          )}
        </div>
        <input
          type="search"
          name="q"
          onChange={(event) => {
            const isFirstSearch = query === undefined;
            submit(event.currentTarget.form, {
              replace: !isFirstSearch,
            });
          }}
          className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Search"
          aria-label="Search contacts"
          defaultValue={query}
        />
      </div>
    </Form>
  );
}

function CreateAction() {
  return (
    <Form method="post">
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <PlusIcon className="-ml-1 h-5 w-5 text-gray-400" />
        New
      </button>
    </Form>
  );
}

function ContactItem(props: {
  contact: {
    id: string;
    avatarUrl: string | null;
    first: string | null;
    last: string | null;
    favorite: boolean | null;
  };
}) {
  const { contact } = props;

  const hasName = contact.first || contact.last;

  return (
    <li>
      <NavLink
        prefetch="intent"
        to={contact.id}
        className={({ isActive }) =>
          classNames(
            isActive ? "bg-gray-100" : "hover:bg-gray-50",
            hasName ? "text-gray-900" : "text-gray-500",
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
          )
        }
      >
        {({ isActive }) => (
          <>
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt=""
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <span className="inline-block h-6 w-6 overflow-hidden rounded-full bg-gray-200">
                <svg
                  className="h-full w-full text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            )}
            <span className="flex-auto">
              {hasName ? (
                `${contact.first} ${contact.last}`.trim()
              ) : (
                <i>No name</i>
              )}
            </span>
            {contact.favorite && (
              <StarIcon
                className={classNames(
                  isActive
                    ? "text-yellow-400"
                    : "text-yellow-300 group-hover:text-yellow-400",
                  "h-5 w-5"
                )}
              />
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}

export default function ContactsRoute() {
  const contacts = [
    {
      id: "123",
      first: "Aimee",
      last: "Douglas",
      avatarUrl:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=1024&h=1024&q=80",
      favorite: true,
    },
    {
      id: "456",
      first: "Calvin",
      last: "Hawkins",
      avatarUrl: null,
      favorite: null,
    },
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto focus:outline-none lg:order-last">
        <Outlet />
      </main>
      <aside className="hidden w-96 shrink-0 divide-y border-r bg-white lg:order-first lg:flex lg:flex-col">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
          <p className="mt-0.5 text-sm text-gray-600">2 total contacts</p>
          <div className="mt-6 flex gap-4">
            <SearchAction />
            <CreateAction />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-6 py-4" aria-label="Contacts">
          <ul role="list" className="space-y-1">
            {contacts.map((contact) => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}