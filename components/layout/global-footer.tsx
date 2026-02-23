const email = "support@polyagent.fund";
export function GlobalFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-[var(--text-muted)]">© 2026 Polyagent. All rights reserved.</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Contact:{" "}
          <a
            href={`mailto:${email}`}
            className="underline decoration-[var(--border-strong)] underline-offset-2 transition hover:text-[var(--text)]"
          >
            {email}
          </a>
        </p>
      </div>
    </footer>
  );
}
