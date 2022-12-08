import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { formatDistanceToNowStrict } from "date-fns";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

type LoaderData = SerializeFrom<typeof loader>;
type LoaderNote = LoaderData["notes"][number];

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
    orderBy: [{ createdAt: "desc" }],
  });

  return json({ notes });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const noteId = formData.get("noteId");
  invariant(typeof noteId === "string", "noteId is missing");

  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });
  if (!note) {
    throw json("Note not found", { status: 404 });
  }

  await prisma.note.delete({ where: { id: note.id } });

  return json(null);
}

function NoteItem(props: { note: LoaderNote }) {
  const { note } = props;

  const deleteFetcher = useFetcher();

  return (
    <li key={note.id} className="py-5">
      <p className="text-sm font-medium text-gray-900">{note.title}</p>
      <p className="mt-1 max-w-prose text-sm text-gray-700">{note.body}</p>
      <div className="mt-2 space-x-2">
        <time
          dateTime={note.createdAt}
          className="text-sm font-medium text-gray-500"
        >
          {formatDistanceToNowStrict(new Date(note.createdAt), {
            addSuffix: true,
            unit: "day",
            roundingMethod: "ceil",
          })}
        </time>
        <span className="text-sm font-medium text-gray-500">·</span>
        <Form action={`${note.id}/edit`} className="inline-flex">
          <button
            type="submit"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Edit
          </button>
        </Form>
        <span className="text-sm font-medium text-gray-500">·</span>
        <deleteFetcher.Form
          method="post"
          onSubmit={(event) => {
            if (!window.confirm("Are you sure you want to delete this note?")) {
              event.preventDefault();
            }
          }}
          className="inline-flex"
        >
          <input type="hidden" name="noteId" value={note.id} />
          <button
            type="submit"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Delete
          </button>
        </deleteFetcher.Form>
      </div>
    </li>
  );
}

export default function ContactNotesRoute() {
  const { notes } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <Form action="new">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
        >
          New note
        </button>
      </Form>
      {notes.length ? (
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">
          <i>No notes found</i>
        </p>
      )}
    </div>
  );
}
