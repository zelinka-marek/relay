import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);

  invariant(params.contactId, "contactId is missing");

  const contact = await prisma.contact.findFirst({
    where: { id: params.contactId, userId },
    select: {
      title: true,
      company: true,
      email: true,
      phone: true,
      location: true,
      twitterHandle: true,
      websiteUrl: true,
      linkedinUrl: true,
      about: true,
    },
  });
  if (!contact) {
    throw new Response("Not found", { status: 404 });
  }

  return json({ contact });
}

export default function ContactProfileRoute() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Title</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {contact.title ?? (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Company</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {contact.company ?? (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Email address</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {contact.email ?? (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Phone</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {contact.phone ?? (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Location</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {contact.location ?? (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Twitter</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {contact.twitterHandle ? (
            `twitter.com/${contact.twitterHandle}`
          ) : (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Website</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {contact.websiteUrl ?? (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">LinkedIn</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {contact.linkedinUrl ? (
            `linkedin.com/in/${contact.linkedinUrl}`
          ) : (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-sm font-medium text-gray-500">About</dt>
        <dd className="mt-1 max-w-prose text-sm text-gray-900">
          {contact.about ?? (
            <span className="text-gray-500">Not available</span>
          )}
        </dd>
      </div>
    </dl>
  );
}
