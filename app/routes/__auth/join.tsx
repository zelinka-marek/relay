import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { Logo } from "~/components/logo";
import { prisma } from "~/db.server";
import { hash } from "~/lib/auth.server";
import { createUserSession, redirectAuthedUser } from "~/session.server";
import { safeRedirect } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  await redirectAuthedUser(request, "/contacts");

  return json(null);
}

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8, "Must be at least 8 characters"),
});

export async function action({ request }: ActionArgs) {
  const data = Object.fromEntries(await request.formData());

  const valid = loginSchema.safeParse(data);
  if (!valid.success) {
    return json({ errors: valid.error.flatten().fieldErrors }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: valid.data.email },
  });
  if (existingUser) {
    return json(
      {
        errors: {
          email: ["A user with this email already exists"],
          password: undefined,
        },
      },
      { status: 400 }
    );
  }

  const hasedPassword = await hash(valid.data.password);
  const user = await prisma.user.create({
    data: {
      email: valid.data.email,
      password: { create: { hash: hasedPassword } },
    },
  });

  const searchParams = new URL(request.url).searchParams;
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/contacts");

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return { title: "Sign up" };
};

export default function JoinRoute() {
  const [searchParams] = useSearchParams();

  const actionData = useActionData<typeof action>();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors.password) {
      passwordRef.current?.focus();
    }
  }, [actionData?.errors.email, actionData?.errors.password]);

  return (
    <div className="space-y-8 sm:mx-auto sm:w-full sm:max-w-lg sm:px-6 lg:px-8">
      <div className="text-center">
        <Logo className="inline-block h-12 w-auto text-primary-600" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Create a new account
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to={{
              pathname: "/login",
              search: searchParams.toString(),
            }}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <Form method="post">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                autoComplete="email"
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
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                autoComplete="new-password"
                aria-invalid={actionData?.errors.password ? true : undefined}
                aria-errormessage="password-errors"
              />
              {actionData?.errors.password && (
                <div
                  id="password-errors"
                  className="mt-2 space-y-1 text-sm text-red-600"
                >
                  {actionData.errors.password.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Sign up
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
