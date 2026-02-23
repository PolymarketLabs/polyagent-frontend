import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { GlobalNav } from "@/components/global-nav";
import { GlobalFooter } from "@/components/layout/global-footer";
import { Web3Provider } from "@/components/providers/web3-provider";
import { getServerAuthSession } from "@/lib/auth/server-session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polyagent | Prediction Market Funds",
  description:
    "Polyagent is a prediction market-driven digital fund custody platform offering diversified investment strategies, secured through blockchain-based transparency to deliver broader choice and greater trust.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const session = await getServerAuthSession();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Web3Provider>
            <div className="flex min-h-screen flex-col">
              <GlobalNav session={session} />
              <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-14 pt-28 sm:px-6 lg:px-8">
                {children}
              </main>
              <GlobalFooter />
            </div>
          </Web3Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
