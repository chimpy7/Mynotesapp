import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const heroImageUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD2B9mSc0s3gSvyNuN6ue62-fGSEHdNeqmwdcUCJlgdN2FJgqsSeoRiazqhZQEbIINg-L4sRVqT9wIfnakrEKOrZcFGqtrGES8i6oqBm8JUnio8Tf70fXTgsvZ6REr4Bo-I7Nqmw2S2b2GWRKd2IO3HbYatVgKspTJainjv-rN1CwCnvw86uJmlol_WRZCIPDmXuc9Y7qxZpWpJZM9gkRxO_1SdfoJanhUjDMeD8ctcq_ljEP55YcojSJm_KSIQ_sjvriKukDnJgynj";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/documents");
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#faf9f7] font-[Arial,Helvetica,sans-serif] text-[#1a1c1b] selection:bg-[#506051]/20">
      <header className="sticky top-0 z-50 w-full bg-[#faf9f7]/95 backdrop-blur-sm transition-colors">
        <nav className="mx-auto flex w-full max-w-[840px] items-center justify-between px-6 py-4">
          <div className="font-[Georgia,serif] text-2xl font-medium tracking-normal text-[#1a1c1b]">
            Notes
          </div>

          <ul className="hidden items-center gap-8 text-base leading-7 md:flex">
            <li>
              <a
                className="border-b border-[#506051] pb-1 font-semibold text-[#506051] transition-colors hover:text-[#506051]"
                href="#writing"
              >
                Writing
              </a>
            </li>
            <li>
              <a
                className="text-[#434842] transition-colors hover:text-[#506051]"
                href="#organization"
              >
                Organization
              </a>
            </li>
          </ul>

          <SignUpButton fallbackRedirectUrl="/documents" mode="modal">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#506051] px-4 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253]"
              type="button"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                +
              </span>
              New Note
            </button>
          </SignUpButton>
        </nav>
      </header>

      <div className="mx-auto flex w-full max-w-[840px] flex-1 flex-col px-6 py-12 md:py-24">
        <section
          className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          id="writing"
        >
          <h1 className="max-w-3xl text-balance font-[Georgia,serif] text-4xl font-normal leading-[44px] tracking-normal text-[#1a1c1b] md:text-5xl md:leading-[56px]">
            Your brain is great at having ideas, but terrible at storing them.
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg leading-[30px] text-[#434842]">
            Notes is the essential, dead-simple app that helps you instantly
            capture and organize your thoughts the moment they strike. No fuss,
            no friction - just write your ideas down and watch them fall
            perfectly into place. Clear the mind-clutter today and use Notes to
            finally make your thoughts make sense.
          </p>
          <div className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <SignUpButton fallbackRedirectUrl="/documents" mode="modal">
              <button
                className="w-full rounded-full bg-[#506051] px-8 py-4 text-[13px] font-medium uppercase leading-4 tracking-wide text-white shadow-[0_4px_14px_0_rgba(80,96,81,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#526253] hover:shadow-[0_6px_20px_rgba(80,96,81,0.3)] sm:w-auto"
                type="button"
              >
                Start writing your masterpiece
              </button>
            </SignUpButton>
            <SignInButton fallbackRedirectUrl="/documents" mode="modal">
              <button
                className="w-full rounded-full border border-[#c3c8c0] bg-white px-8 py-4 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#f4f3f1] sm:w-auto"
                type="button"
              >
                Sign in
              </button>
            </SignInButton>
          </div>
        </section>

        <section className="mt-20 w-full md:mt-28" id="organization">
          <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#c3c8c0]/30 bg-white shadow-[0_20px_60px_-15px_rgba(80,96,81,0.08)] md:aspect-[21/9]">
            <img
              alt="A serene minimalist workspace with an open notebook and pen."
              className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
              src={heroImageUrl}
            />
            <div className="absolute bottom-8 left-8 max-w-[280px] rounded-lg border border-white/50 bg-[#faf9f7]/80 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] backdrop-blur-md transition-transform duration-500 hover:-translate-y-1 md:bottom-12 md:left-12">
              <div className="mb-4 h-2 w-12 rounded-full bg-[#506051]/20" />
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-[#c3c8c0]/40" />
                <div className="h-1.5 w-4/5 rounded-full bg-[#c3c8c0]/40" />
                <div className="h-1.5 w-5/6 rounded-full bg-[#c3c8c0]/40" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-auto border-t border-[#c3c8c0]/30 bg-[#faf9f7]">
        <div className="mx-auto flex w-full max-w-[840px] flex-col items-center gap-4 px-6 py-12">
          <div className="mb-2 font-[Georgia,serif] text-2xl font-medium tracking-normal text-[#1a1c1b]">
            Notes
          </div>
          <ul className="flex flex-wrap justify-center gap-6 text-[13px] font-medium uppercase leading-4 tracking-wide">
            <li>
              <a
                className="text-[#747872] transition-colors hover:text-[#506051]"
                href="#"
              >
                Privacy
              </a>
            </li>
            <li>
              <a
                className="text-[#747872] transition-colors hover:text-[#506051]"
                href="#"
              >
                Terms
              </a>
            </li>
            <li>
              <a
                className="text-[#747872] transition-colors hover:text-[#506051]"
                href="#"
              >
                Contact
              </a>
            </li>
          </ul>
          <div className="mt-4 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#486173]">
            (c) 2024 Notes. Designed for the flow state.
          </div>
        </div>
      </footer>
    </main>
  );
}
