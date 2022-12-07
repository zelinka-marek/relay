import { PencilIcon, StarIcon, TrashIcon } from "@heroicons/react/20/solid";
import type { Contact } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
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

export async function loader({ params }: LoaderArgs) {
  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findUnique({
    where: { id: params.contactId },
    select: {
      firstName: true,
      lastName: true,
      avatarUrl: true,
      favorite: true,
    },
  });
  if (!contact) {
    throw json("Contact not found", { status: 404 });
  }

  return json({ contact });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findUnique({
    where: { id: params.contactId },
    select: { id: true, favorite: true },
  });
  if (!contact) {
    throw json("Contact not found", { status: 404 });
  }

  const formData = await request.formData();

  const intent = formData.get("intent");
  if (intent === "favorite") {
    await prisma.contact.update({
      where: { id: contact.id },
      data: { favorite: !contact.favorite },
    });

    return json(null);
  } else if (intent === "delete") {
    await prisma.contact.delete({ where: { id: contact.id } });

    return redirect("/contacts");
  }

  throw json(`Unexpected operation by the intent of "${intent}"`, {
    status: 400,
  });
}

function ContactsLayout(props: {
  containError?: boolean;
  children?: React.ReactNode;
}) {
  const { containError, children } = props;

  return (
    <div
      className={classNames(
        containError && "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8",
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

  let favorite = contact.favorite;
  if (favoriteFetcher.submission) {
    favorite = !favorite;
  }

  return (
    <favoriteFetcher.Form method="post">
      <button
        type="submit"
        name="intent"
        value="favorite"
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        className="rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
      >
        <StarIcon
          className={classNames(
            favorite
              ? "text-yellow-300 hover:text-yellow-400"
              : "text-gray-300 hover:text-gray-400",
            "h-5 w-5"
          )}
        />
      </button>
    </favoriteFetcher.Form>
  );
}

function EditAction() {
  return (
    <Form action="edit">
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
      >
        <PencilIcon className="-ml-1 h-5 w-5 text-gray-400" />
        Edit
      </button>
    </Form>
  );
}

function DeleteAction() {
  return (
    <Form
      method="post"
      onSubmit={(event) => {
        if (!window.confirm("Are you sure you want to delete this contact?")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        name="intent"
        value="delete"
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
      >
        <TrashIcon className="-ml-1 h-5 w-5 text-gray-400" />
        Delete
      </button>
    </Form>
  );
}

const tabs: { name: string; to: LinkProps["to"] }[] = [
  { name: "Profile", to: "" },
  { name: "Notes", to: "notes" },
];

export default function ContactRoute() {
  const { contact } = useLoaderData<typeof loader>();

  const name = (
    <div className="flex items-baseline gap-4">
      <h1 className="truncate text-2xl font-bold text-gray-900">
        {contact.firstName || contact.lastName ? (
          `${contact.firstName} ${contact.lastName}`.trim()
        ) : (
          <i className="text-gray-500">No name</i>
        )}
      </h1>
      <FavoriteAction contact={contact} />
    </div>
  );

  return (
    <ContactsLayout>
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
              <EditAction />
              <DeleteAction />
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
                  prefetch="render"
                  end
                  to={tab.to}
                  className={({ isActive }) =>
                    classNames(
                      isActive
                        ? "border-indigo-500 text-gray-900"
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
    </ContactsLayout>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 400) {
    return (
      <ContactsLayout containError>
        <Alert title="Unable to proceed with this operation" />
      </ContactsLayout>
    );
  } else if (caught.status === 404) {
    return (
      <ContactsLayout containError>
        <Alert title="No contact found">
          We can't find the contact you're looking for. Please check your URL.
          Has the contact been deleted?
        </Alert>
      </ContactsLayout>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return (
    <ContactsLayout containError>
      <Alert title="An unexpected error occurred">
        We can't load the contact you're looking for. Please chek your URL and
        try again later.
      </Alert>
    </ContactsLayout>
  );
}
