import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import type { Prisma } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useSearchParams,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import classNames from "clsx";
import { useSpinDelay } from "spin-delay";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q");

  const contactsCount = await prisma.contact.count();

  const where: Prisma.ContactWhereInput = {};
  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      favorite: true,
    },
    orderBy: [{ lastName: "asc" }, { createdAt: "asc" }],
  });

  return json({ contacts, contactsCount });
}

export async function action() {
  const contact = await prisma.contact.create({
    data: {},
  });

  return redirect(`/contacts/${contact.id}/edit`);
}

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
    <Form role="search" className="w-full">
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
          className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Search"
          aria-label="Search contacts"
          defaultValue={query}
        />
      </div>
    </Form>
  );
}

export default function ContactsRoute() {
  const { contacts, contactsCount } = useLoaderData<typeof loader>();

  const transition = useTransition();
  const navigating = transition.state === "loading";

  const location = useLocation();
  const matchesRoute = location.pathname.match(/contacts\/?$/);

  return (
    <div className="flex flex-1 overflow-hidden">
      <main
        className={classNames(
          matchesRoute && "hidden lg:block",
          navigating && "opacity-25 transition-opacity delay-200 duration-200",
          "flex-1 overflow-y-auto focus:outline-none lg:order-last"
        )}
      >
        <Outlet />
      </main>
      <aside
        className={classNames(
          matchesRoute ? "w-full" : "hidden",
          "shrink-0 bg-white lg:order-first lg:flex lg:w-96 lg:flex-col lg:border-r"
        )}
      >
        <div className="border-b">
          <div
            className={classNames(
              matchesRoute && "lg:max-w-auto mx-auto max-w-3xl lg:mx-0",
              "px-6 pt-6 pb-4"
            )}
          >
            <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {contactsCount} total{" "}
              {contactsCount === 1 ? "contact" : "contacts"}
            </p>
            <div className="mt-6 flex gap-4">
              <SearchAction />
              <Form method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <PlusIcon className="-ml-1 h-5 w-5 text-gray-400" />
                  New
                </button>
              </Form>
            </div>
          </div>
        </div>
        <nav
          className={classNames(
            matchesRoute && "lg:max-w-auto mx-auto max-w-3xl lg:mx-0",
            "flex-1 overflow-y-auto px-6 py-4"
          )}
        >
          {contacts.length ? (
            <ul role="list" className="space-y-1">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    prefetch="intent"
                    to={contact.id}
                    className={({ isActive }) =>
                      classNames(
                        isActive ? "bg-gray-50" : "hover:bg-gray-50",
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900"
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
                          <span className="inline-block h-6 w-6 overflow-hidden rounded-full bg-gray-100">
                            <svg
                              className="h-full w-full text-gray-300"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </span>
                        )}
                        <span className="flex-auto">
                          {contact.firstName || contact.lastName ? (
                            `${contact.firstName} ${contact.lastName}`.trim()
                          ) : (
                            <i className="text-gray-500">No name</i>
                          )}
                          {contact.favorite && (
                            <span className="sr-only">, starred</span>
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
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              <i>No contacts found</i>
            </p>
          )}
        </nav>
      </aside>
    </div>
  );
}
