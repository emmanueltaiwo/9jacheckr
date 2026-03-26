export function NafdacUnavailablePage() {
  return (
    <div
      role="alert"
      className="flex min-h-screen min-w-0 flex-col items-center justify-center bg-(--bg) px-6 py-16 text-center"
    >
      <div className="max-w-md space-y-4">
        <p className="font-display text-xl font-semibold text-foreground">
          NAFDAC lookups are temporarily unavailable
        </p>
        <p className="text-[15px] leading-relaxed text-(--text-2)">
          NAFDAC&apos;s public site has changed on their side (for example
          captcha). We can&apos;t complete live checks until we ship an update.
        </p>
        <p className="text-[14px] text-(--text-3)">
          Please try again later — we&apos;ll remove this screen as soon as
          we&apos;re back online.
        </p>
      </div>
    </div>
  );
}
