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
  });
  if (!contact) {
    throw json("Contact not found", { status: 404 });
  }

  return json({ contact });
}

const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  lastName: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  avatarUrl: z
    .union([z.literal(""), z.string().trim().url().nullish()])
    .transform((val) => val || null),
  title: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  company: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  email: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  phone: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  location: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  twitterHandle: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  websiteUrl: z
    .union([z.literal(""), z.string().trim().url().nullish()])
    .transform((val) => val || null),
  linkedinUrl: z
    .union([z.literal(""), z.string().trim().url().nullish()])
    .transform((val) => val || null),
  about: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
});

export async function action({ request, params }: ActionArgs) {
  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findUnique({
    where: { id: params.contactId },
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

  return (
    <EditContactLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Form method="post">
          <div className="space-y-6">
            <h1 className="truncate text-2xl font-bold text-gray-900">
              Edit Contact
            </h1>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
              <div className="sm:col-span-3">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.firstName ?? undefined}
                  aria-invalid={actionData?.errors.firstName ? true : undefined}
                  aria-errormessage="firstName-errors"
                />
                {actionData?.errors.firstName && (
                  <div
                    id="firstName-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.firstName.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.lastName ?? undefined}
                  aria-invalid={actionData?.errors.lastName ? true : undefined}
                  aria-errormessage="lastName-errors"
                />
                {actionData?.errors.lastName && (
                  <div
                    id="lastName-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.lastName.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-full">
                <label
                  htmlFor="avatarUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Avatar URL
                </label>
                <input
                  type="url"
                  name="avatarUrl"
                  id="avatarUrl"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.avatarUrl ?? undefined}
                  aria-invalid={actionData?.errors.avatarUrl ? true : undefined}
                  aria-errormessage="avatarUrl-errors"
                />
                {actionData?.errors.avatarUrl && (
                  <div
                    id="avatarUrl-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.avatarUrl.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-full">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.location ?? undefined}
                  aria-invalid={actionData?.errors.location ? true : undefined}
                  aria-errormessage="location-errors"
                />
                {actionData?.errors.location && (
                  <div
                    id="location-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.location.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.email ?? undefined}
                  aria-invalid={actionData?.errors.email ? true : undefined}
                  aria-errormessage="email-errors"
                />
                {actionData?.errors.email && (
                  <div
                    id="email-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.email.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.title ?? undefined}
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
              <div className="sm:col-span-3">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.company ?? undefined}
                  aria-invalid={actionData?.errors.company ? true : undefined}
                  aria-errormessage="company-errors"
                />
                {actionData?.errors.company && (
                  <div
                    id="company-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.company.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.phone ?? undefined}
                  aria-invalid={actionData?.errors.phone ? true : undefined}
                  aria-errormessage="phone-errors"
                />
                {actionData?.errors.phone && (
                  <div
                    id="phone-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.phone.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="twitterHandle"
                  className="block text-sm font-medium text-gray-700"
                >
                  Twitter
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    name="twitterHandle"
                    id="twitterHandle"
                    className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    defaultValue={contact.twitterHandle ?? undefined}
                    aria-invalid={
                      actionData?.errors.twitterHandle ? true : undefined
                    }
                    aria-errormessage="twitterHandle-errors"
                  />
                </div>
                {actionData?.errors.twitterHandle && (
                  <div
                    id="twitterHandle-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.twitterHandle.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="websiteUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Website
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  id="websiteUrl"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.websiteUrl ?? undefined}
                  aria-invalid={
                    actionData?.errors.websiteUrl ? true : undefined
                  }
                  aria-errormessage="websiteUrl-errors"
                />
                {actionData?.errors.websiteUrl && (
                  <div
                    id="websiteUrl-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.websiteUrl.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="linkedinUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  id="linkedinUrl"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.linkedinUrl ?? undefined}
                  aria-invalid={
                    actionData?.errors.linkedinUrl ? true : undefined
                  }
                  aria-errormessage="linkedinUrl-errors"
                />
                {actionData?.errors.linkedinUrl && (
                  <div
                    id="linkedinUrl-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.linkedinUrl.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-full">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium text-gray-700"
                >
                  About
                </label>
                <textarea
                  name="about"
                  id="about"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={contact.about ?? undefined}
                  aria-invalid={actionData?.errors.about ? true : undefined}
                  aria-errormessage="about-errors"
                />
                {actionData?.errors.about && (
                  <div
                    id="about-errors"
                    className="mt-2 space-y-1 text-sm text-red-600"
                  >
                    {actionData.errors.about.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  navigate(-1);
                }}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
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
