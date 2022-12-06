import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import classNames from "clsx";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Alert } from "~/components/alert";
import { prisma } from "~/db.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findUnique({
    where: { id: params.contactId },
    select: {
      id: true,
      first: true,
      last: true,
      avatarUrl: true,
      favorite: true,
    },
  });
  if (!contact) {
    throw json("Contact not found", { status: 404 });
  }

  return json({ contact });
}

const contactSchema = z.object({
  first: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  last: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  avatarUrl: z
    .union([z.literal(""), z.string().url().trim().nullish()])
    .transform((val) => val || null),
});

export async function action({ request, params }: ActionArgs) {
  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findUnique({
    where: { id: params.contactId },
    select: { id: true, favorite: true },
  });
  if (!contact) {
    throw json("Contact not found", { status: 404 });
  }

  const data = Object.fromEntries(await request.formData());

  const valid = contactSchema.safeParse(data);
  if (!valid.success) {
    return json({ errors: valid.error.flatten().fieldErrors }, { status: 400 });
  }

  await prisma.contact.update({
    where: { id: contact.id },
    data: valid.data,
  });

  return redirect(`/contacts/${contact.id}`);
}

function EditContactLayout(props: {
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

export default function EditContactRoute() {
  const { contact } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  const fields: {
    label: string;
    type: string;
    name: keyof Omit<typeof contact, "id" | "favorite">;
    className: string;
  }[] = [
    {
      label: "First Name",
      type: "text",
      name: "first",
      className: "sm:col-span-3",
    },
    {
      label: "Last Name",
      type: "text",
      name: "last",
      className: "sm:col-span-3",
    },
    {
      label: "Avatar URL",
      type: "url",
      name: "avatarUrl",
      className: "sm:col-span-full",
    },
  ];

  return (
    <EditContactLayout>
      <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
        <h1 className="truncate text-2xl font-bold text-gray-900">
          Edit Contact
        </h1>
        <Form method="post">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {fields.map((field) => (
              <div key={field.name} className={field.className}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact[field.name] ?? undefined}
                  aria-invalid={
                    actionData?.errors[field.name] ? true : undefined
                  }
                  aria-errormessage="email-error"
                />
                {actionData?.errors[field.name]?.map((error) => (
                  <div
                    key={error}
                    id="email-error"
                    className="mt-2 space-y-2 text-sm text-red-600"
                  >
                    <p>{error}</p>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-end gap-3 sm:col-span-full">
              <button
                type="button"
                onClick={() => {
                  navigate(`/contacts/${contact.id}`);
                }}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </Form>
      </div>
    </EditContactLayout>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <EditContactLayout containError>
        <Alert title="No contact found">
          We can't find the contact you're looking for. Please check your URL.
          Has the contact been deleted?
        </Alert>
      </EditContactLayout>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return (
    <EditContactLayout containError>
      <Alert title="An unexpected error occurred">
        We can't load the contact you're looking for. Please chek your URL and
        try again later.
      </Alert>
    </EditContactLayout>
  );
}
