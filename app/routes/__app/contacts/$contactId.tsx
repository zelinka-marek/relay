import { PencilIcon, StarIcon, TrashIcon } from "@heroicons/react/20/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import classNames from "clsx";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findUnique({
    where: { id: params.contactId },
    select: { first: true, last: true, avatarUrl: true, favorite: true },
  });
  if (!contact) {
    throw json("Contact not found", { status: 404 });
  }

  return json(contact);
}

function FavoriteAction(props: { favorite: boolean | null }) {
  const { favorite } = props;

  return (
    <Form method="post">
      <button
        type="submit"
        aria-label={!favorite ? "Add to favorites" : "Remove from favorites"}
        className="relative rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
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
    </Form>
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
    <Form action="delete" method="post">
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
      >
        <TrashIcon className="-ml-1 h-5 w-5 text-gray-400" />
        Delete
      </button>
    </Form>
  );
}

export default function ContactRoute() {
  const contact = useLoaderData<typeof loader>();

  const hasName = contact.first || contact.last;
  const name = (
    <div className="flex items-baseline gap-4">
      <h1 className="truncate text-2xl font-bold text-gray-900">
        {hasName ? (
          `${contact.first} ${contact.last}`.trim()
        ) : (
          <i className="text-gray-500">No name</i>
        )}
      </h1>
      <FavoriteAction favorite={contact.favorite} />
    </div>
  );

  return (
    <article>
      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-12 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:flex sm:items-end sm:gap-5">
          {contact.avatarUrl ? (
            <img
              className="h-24 w-24 rounded-xl sm:h-32 sm:w-32"
              src={contact.avatarUrl}
              alt=""
            />
          ) : (
            <span className="inline-block h-24 w-24 overflow-hidden rounded-xl bg-gray-200 sm:h-32 sm:w-32">
              <svg
                className="h-full w-full text-gray-400"
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
    </article>
  );
}
