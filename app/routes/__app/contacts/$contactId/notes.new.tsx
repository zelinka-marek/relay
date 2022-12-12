import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { prisma } from "~/db.server";

const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(260, "Description is too long"),
});

export async function action({ request, params }: ActionArgs) {
  invariant(params.contactId, "contactId is missing");

  const data = Object.fromEntries(await request.formData());

  const valid = noteSchema.safeParse(data);
  if (!valid.success) {
    return json({ errors: valid.error.flatten().fieldErrors }, { status: 400 });
  }

  await prisma.note.create({
    data: {
      ...valid.data,
      contact: {
        connect: { id: params.contactId },
      },
    },
  });

  return redirect(`/contacts/${params.contactId}/notes`);
}

export default function NewNoteRoute() {
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
          New Note
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
            Description
          </label>
          <textarea
            ref={bodyRef}
            name="body"
            id="body"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Weite a note..."
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
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </Form>
  );
}
