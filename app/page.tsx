import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/documents");
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link className="text-base font-semibold tracking-normal" href="/">
          Document Studio
        </Link>
        <nav className="flex items-center gap-2">
          <SignInButton fallbackRedirectUrl="/documents" mode="modal">
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
              type="button"
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton fallbackRedirectUrl="/documents" mode="modal">
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              type="button"
            >
              Sign up
            </button>
          </SignUpButton>
        </nav>
      </header>

      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Private rich notes
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
              Document Studio
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
              A focused writing workspace for notes, journals, and long-form
              documents. Start writing first, then organize everything into
              categories when it makes sense.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SignUpButton fallbackRedirectUrl="/documents" mode="modal">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  type="button"
                >
                  Start writing
                </button>
              </SignUpButton>
              <SignInButton fallbackRedirectUrl="/documents" mode="modal">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
                  type="button"
                >
                  Sign in
                </button>
              </SignInButton>
            </div>
          </div>

          <div
            aria-label="Product preview"
            className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 p-3 shadow-sm"
          >
            <div className="rounded-md border border-zinc-200 bg-white">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <div className="grid min-h-[420px] grid-cols-[0.8fr_1.2fr]">
                <aside className="border-r border-zinc-200 bg-zinc-50 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Categories
                  </p>
                  <div className="mt-5 grid gap-3">
                    {["Uncategorized", "Research", "Journal", "Project notes"].map(
                      (item, index) => (
                        <div
                          className={`h-10 rounded-md border px-3 py-2 text-sm ${
                            index === 0
                              ? "border-zinc-900 bg-zinc-900 text-white"
                              : "border-zinc-200 bg-white text-zinc-700"
                          }`}
                          key={item}
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                </aside>
                <section className="p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Current draft
                  </p>
                  <div className="mt-5 h-8 w-3/4 rounded bg-zinc-900" />
                  <div className="mt-6 grid gap-3">
                    <div className="h-3 rounded bg-zinc-300" />
                    <div className="h-3 rounded bg-zinc-300" />
                    <div className="h-3 w-5/6 rounded bg-zinc-300" />
                    <div className="mt-4 h-24 rounded-md border border-zinc-200 bg-zinc-50" />
                    <div className="h-3 rounded bg-zinc-300" />
                    <div className="h-3 w-2/3 rounded bg-zinc-300" />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          {
            title: "Create first",
            text: "Open a blank rich document without choosing folders up front.",
          },
          {
            title: "Organize later",
            text: "Move documents into categories and subcategories when your structure is clear.",
          },
          {
            title: "Private by default",
            text: "Documents are tied to your authenticated user account.",
          },
        ].map((feature) => (
          <article
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            key={feature.title}
          >
            <h2 className="text-lg font-semibold tracking-normal">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {feature.text}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
