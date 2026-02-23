"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useTransition } from "react";

import type { AuthSession } from "@/lib/api/services/auth";
import Link from "@/components/navigation/ref-link";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LocaleCode = "en" | "zh";
type NavLabelKey = "funds" | "myInvestments" | "fundManagement";
type UserRole = "INVESTOR" | "MANAGER";

type NavItem = {
  href: string;
  labelKey: NavLabelKey;
  requiresAuth?: boolean;
  requiredRole?: UserRole;
};

type GlobalNavProps = {
  session: AuthSession | null;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/market/funds", labelKey: "funds" },
  { href: "/investment/funds", labelKey: "myInvestments", requiresAuth: true },
  {
    href: "/manager",
    labelKey: "fundManagement",
    requiresAuth: true,
    requiredRole: "MANAGER",
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/market/funds") {
    return (
      pathname === "/" || pathname === "/market/funds" || pathname.startsWith("/market/funds/")
    );
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GlobalNav({ session: initialSession }: GlobalNavProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const session = initialSession;
  const [isSwitchingLocale, startLocaleTransition] = useTransition();
  const currentLocale: LocaleCode = locale === "zh" ? "zh" : "en";
  const isAuthenticated = Boolean(session?.address);

  const links = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (!item.requiresAuth) {
        return true;
      }

      if (!isAuthenticated) {
        return false;
      }

      if (item.requiredRole && session?.role !== item.requiredRole) {
        return false;
      }

      return true;
    });
  }, [isAuthenticated, session?.role]);

  const localeOptions: Array<{ value: LocaleCode; label: string }> = [
    { value: "en", label: t("languageEnglish") },
    { value: "zh", label: t("languageChinese") },
  ];

  const switchLocale = (nextLocale: string) => {
    if ((nextLocale !== "en" && nextLocale !== "zh") || nextLocale === currentLocale) {
      return;
    }

    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    startLocaleTransition(() => {
      router.refresh();
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold tracking-wide text-[var(--text)]"
        >
          {t("brand")}
        </Link>

        <nav className="hidden flex-1 items-center gap-2 md:flex">
          {links.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ConnectWalletButton initialSession={session} />

          <Select value={currentLocale} onValueChange={switchLocale} disabled={isSwitchingLocale}>
            <SelectTrigger className="w-16 md:w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {localeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-2 overflow-x-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
        {links.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--surface-muted-strong)]"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
