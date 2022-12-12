import {
  ArrowLongLeftIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
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
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);

  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q");

  const contactsCount = await prisma.contact.count({
    where: { userId },
  });

  const contacts = await prisma.contact.findMany({
    where: {
      userId,
      OR: query
        ? [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
          ]
        : undefined,
    },
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

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const contact = await prisma.contact.create({
    data: { userId },
  });

  return redirect(`/contacts/${contact.id}/edit`);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data.contacts.length) {
    return { title: "No contacts" };
  }

  return {
    title: `Contacts (${data.contactsCount} ${
      data.contactsCount === 1 ? "contact" : "contacts"
    })`,
  };
};

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
          className="block w-full rounded-md border-gray-300 pl-10 text-sm focus:border-primary-500 focus:ring-primary-500"
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
    <main className="flex flex-1 overflow-hidden">
      <div
        className={classNames(
          matchesRoute && "hidden lg:block",
          navigating && "opacity-25 transition-opacity delay-200 duration-200",
          "flex-1 overflow-y-auto focus:outline-none lg:order-last"
        )}
      >
        <nav className="border-b py-3 lg:hidden" aria-label="Breadcrumb">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <Link
                to="."
                className="group inline-flex gap-3 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowLongLeftIcon className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-600" />
                Back to Contacts
              </Link>
            </div>
          </div>
        </nav>
        <Outlet />
      </div>
      <div
        className={classNames(
          matchesRoute ? "w-full" : "hidden",
          "shrink-0 bg-white lg:order-first lg:flex lg:w-96 lg:flex-col lg:border-r"
        )}
      >
        <div className="border-b">
          <div
            className={classNames(
              matchesRoute && "lg:max-w-auto mx-auto max-w-3xl lg:mx-0",
              "px-6 py-4"
            )}
          >
            <div className="flex gap-4">
              <SearchAction />
              <Form method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <PlusIcon className="-ml-1 h-5 w-5" />
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
          aria-label="Contacts"
        >
          {contacts.length ? (
            <ul role="list" className="space-y-1">
              {contacts.map((contact) => {
                const hasName = contact.firstName || contact.lastName;

                return (
                  <li key={contact.id}>
                    <NavLink
                      prefetch="intent"
                      to={contact.id}
                      className={({ isActive }) =>
                        classNames(
                          isActive ? "bg-primary-500" : "hover:bg-gray-50",
                          hasName
                            ? isActive
                              ? "text-white"
                              : "text-gray-900"
                            : isActive
                            ? "text-primary-100"
                            : "text-gray-500",
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
                            {hasName
                              ? `${contact.firstName} ${contact.lastName}`.trim()
                              : "No name"}
                            {contact.favorite && (
                              <span className="sr-only">, starred</span>
                            )}
                          </span>
                          {contact.favorite && (
                            <StarIcon
                              className={classNames(
                                !isActive &&
                                  "text-yellow-300 group-hover:text-yellow-400",
                                "h-5 w-5"
                              )}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No contacts found</p>
          )}
        </nav>
      </div>
    </main>
  );
}
