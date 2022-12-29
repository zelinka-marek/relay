import { PencilIcon, StarIcon, TrashIcon } from "@heroicons/react/20/solid";
import type { Contact } from "@prisma/client";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { LinkProps } from "@remix-run/react";
import {
  Form,
  NavLink,
  Outlet,
  useCatch,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import classNames from "clsx";
import React from "react";
import invariant from "tiny-invariant";
import { Alert } from "~/components/alert";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);

  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findFirst({
    where: { id: params.contactId, userId },
    select: {
      firstName: true,
      lastName: true,
      avatarUrl: true,
      favorite: true,
      userId: true,
    },
  });
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ contact });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);

  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findFirst({
    where: { id: params.contactId, userId },
  });
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();

  const intent = formData.get("intent");
  switch (intent) {
    case "favorite": {
      const updatedContact = await prisma.contact.update({
        where: { id: contact.id },
        data: { favorite: !contact.favorite },
      });

      return json({ updatedContact });
    }
    case "delete": {
      await prisma.contact.delete({ where: { id: contact.id } });

      return redirect("/contacts");
    }
    default: {
      throw new Response(`Unexpected operation by the intent of "${intent}"`, {
        status: 400,
      });
    }
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.contact) {
    return { title: "Not Found" };
  }

  const name =
    data.contact.firstName || data.contact.lastName
      ? `${data.contact.firstName} ${data.contact.lastName}`.trim()
      : "No name";

  return {
    title: name,
  };
};

function Layout(props: { hasError?: boolean; children?: React.ReactNode }) {
  const { hasError, children } = props;

  return (
    <div
      className={classNames(
        hasError && "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8",
        "py-10"
      )}
    >
      {children}
    </div>
  );
}

function FavoriteAction(props: { contact: Pick<Contact, "favorite"> }) {
  const { contact } = props;

  const favoriteFetcher = useFetcher();

  let isFavorite = contact.favorite;
  if (favoriteFetcher.submission) {
    isFavorite = !isFavorite;
  }

  return (
    <favoriteFetcher.Form method="post">
      <button
        type="submit"
        name="intent"
        value="favorite"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <StarIcon
          className={classNames(
            isFavorite
              ? "text-yellow-300 hover:text-yellow-400"
              : "text-gray-300 hover:text-gray-400",
            "h-5 w-5"
          )}
        />
      </button>
    </favoriteFetcher.Form>
  );
}

const tabs: { name: string; to: LinkProps["to"] }[] = [
  { name: "Profile", to: "." },
  { name: "Notes", to: "notes" },
];

export default function ContactRoute() {
  const { contact } = useLoaderData<typeof loader>();

  const hasName = contact.firstName || contact.lastName;
  const name = (
    <div className="flex items-baseline gap-4">
      <h1
        className={classNames(
          hasName ? "text-gray-900" : "text-gray-500",
          "truncate text-2xl font-bold text-gray-900"
        )}
      >
        {hasName
          ? `${contact.firstName} ${contact.lastName}`.trim()
          : "No name"}
      </h1>
      <FavoriteAction contact={contact} />
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:flex sm:items-end sm:gap-5">
          {contact.avatarUrl ? (
            <img
              className="h-24 w-24 rounded-xl sm:h-32 sm:w-32"
              src={contact.avatarUrl}
              alt=""
            />
          ) : (
            <span className="inline-block h-24 w-24 overflow-hidden rounded-xl bg-gray-100 sm:h-32 sm:w-32">
              <svg
                className="h-full w-full text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          )}
          <div className="sm:flex sm:flex-1 sm:items-center sm:justify-end sm:gap-6 sm:pb-1">
            <div className="mt-6 flex-1 sm:hidden">{name}</div>
            <div className="justify-stretch mt-6 flex flex-col gap-y-3 sm:flex-row sm:gap-x-4">
              <Form action="edit">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <PencilIcon className="-ml-1 h-5 w-5 text-gray-400" />
                  Edit
                </button>
              </Form>
              <Form
                method="post"
                onSubmit={(event) => {
                  if (
                    !window.confirm(
                      "Are you sure you want to delete this contact?"
                    )
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <TrashIcon className="-ml-1 h-5 w-5 text-gray-400" />
                  Delete
                </button>
              </Form>
            </div>
          </div>
        </div>
        <div className="hidden flex-1 sm:block">{name}</div>
      </div>
      <div className="mt-6 sm:mt-2">
        <div className="border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  prefetch="intent"
                  end={tab.to === "."}
                  to={tab.to}
                  className={({ isActive }) =>
                    classNames(
                      isActive
                        ? "border-primary-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                    )
                  }
                >
                  {tab.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-3xl px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </Layout>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  switch (caught.status) {
    case 400: {
      return (
        <Layout hasError>
          <Alert title="Unable to proceed with this operation" />
        </Layout>
      );
    }
    case 404: {
      return (
        <Layout hasError>
          <Alert title="No contact found">
            We can't find the contact you're looking for. Please check your URL.
            Has the contact been deleted?
          </Alert>
        </Layout>
      );
    }
    default: {
      throw new Error(
        `Unexpected caught response with status: ${caught.status}`
      );
    }
  }
}

export function ErrorBoundary() {
  return (
    <Layout hasError>
      <Alert title="An unexpected error occurred">
        We can't load the contact you're looking for. Please chek your URL and
        try again later.
      </Alert>
    </Layout>
  );
}
