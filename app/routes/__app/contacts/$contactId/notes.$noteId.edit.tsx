import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Alert } from "~/components/alert";
import { prisma } from "~/db.server";

export async function loader({ params }: ActionArgs) {
  invariant(params.noteId, "noteId is missing");

  const note = await prisma.note.findUnique({
    where: { id: params.noteId },
    select: { title: true, body: true },
  });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ note });
}

const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(260, "Content is too long"),
});

export async function action({ request, params }: ActionArgs) {
  invariant(params.contactId, "contactId is missing");
  invariant(params.noteId, "noteId is missing");

  const note = await prisma.note.findFirst({
    where: { id: params.noteId, contactId: params.contactId },
  });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  const validation = noteSchema.safeParse({ title, body });
  if (!validation.success) {
    return json(
      { errors: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await prisma.note.update({
    where: { id: note.id },
    data: validation.data,
  });

  return redirect(`/contacts/${params.contactId}/notes`);
}

export default function EditNoteRoute() {
  const { note } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors.body) {
      bodyRef.current?.focus();
    }
  }, [actionData?.errors.body, actionData?.errors.title]);

  return (
    <Form method="post">
      <div className="space-y-6">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          Edit Note
        </h2>
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            ref={titleRef}
            type="text"
            name="title"
            id="title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Title"
            defaultValue={note.title}
            aria-invalid={actionData?.errors.title ? true : undefined}
            aria-errormessage="title-errors"
          />
          {actionData?.errors.title && (
            <div
              id="title-errors"
              className="mt-2 space-y-1 text-sm text-red-600"
            >
              {actionData.errors.title.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            ref={bodyRef}
            name="body"
            id="body"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Write a note..."
            defaultValue={note.body}
            aria-invalid={actionData?.errors.body ? true : undefined}
            aria-errormessage="body-errors"
          />
          {actionData?.errors.body && (
            <div
              id="body-errors"
              className="mt-2 space-y-1 text-sm text-red-600"
            >
              {actionData.errors.body.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
            className="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  switch (caught.status) {
    case 404: {
      return (
        <Alert title="No note found">
          We can't find the note you're looking for. Please check your URL. Has
          the note been deleted?
        </Alert>
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
    <Alert title="An unexpected error occurred">
      We can't load the note you're looking for. Please chek your URL and try
      again later.
    </Alert>
  );
}
