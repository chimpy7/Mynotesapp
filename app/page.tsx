import { Show } from "@clerk/nextjs";
import { AuthControls } from "@/components/auth/AuthControls";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Create document
            </p>
            <AuthControls />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">
                Untitled document
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">
                Draft first, organize into categories later.
              </p>
            </div>
            <Show when="signed-in">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                type="button"
              >
                Save draft
              </button>
            </Show>
          </div>
        </header>

        <Show when="signed-out">
          <section className="rounded-lg border border-zinc-200 bg-white px-6 py-8 shadow-sm">
            <h2 className="text-xl font-semibold tracking-normal">
              Sign in to start writing
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">
              Create an account or sign in to keep your documents private and
              tied to your user account.
            </p>
          </section>
        </Show>

        <Show when="signed-in">
          <section aria-label="Document editor">
            <RichTextEditor />
          </section>
        </Show>
      </div>
    </main>
  );
}
