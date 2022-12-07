import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { formatDistanceToNowStrict, format } from "date-fns";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.contactId, "contactId is missing");

  const notes = await prisma.note.findMany({
    where: { contactId: params.contactId },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "asc" }],
  });
  if (!notes) {
    throw json("Notes not found", { status: 404 });
  }

  return json({ notes });
}

export default function ContactNotesRoute() {
  const { notes } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <Form action="new">
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
        >
          New note
        </button>
      </Form>
      <div className="flow-root">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {notes.map((note) => (
            <li key={note.id} className="py-5">
              <p className="text-sm font-medium text-gray-800">{note.title}</p>
              <p className="text-sm text-gray-500">
                <time dateTime={note.createdAt}>
                  {format(new Date(note.createdAt), "MMM d")},{" "}
                  {formatDistanceToNowStrict(new Date(note.createdAt), {
                    addSuffix: true,
                    unit: "day",
                    roundingMethod: "ceil",
                  })}
                </time>
              </p>
              <p className="mt-1 max-w-prose text-sm text-gray-600">
                {note.body}
              </p>
              <div className="mt-2 flex gap-2">
                <Form action={`${note.id}/edit`} className="inline-flex">
                  <button
                    type="submit"
                    className="rounded-md bg-gray-50 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Edit
                  </button>
                </Form>
                <span className="text-gray-500">·</span>
                <Form method="post" className="inline-flex">
                  <button
                    type="submit"
                    className="rounded-md bg-gray-50 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
