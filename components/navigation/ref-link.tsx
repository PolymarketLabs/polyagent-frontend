"use client";

import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { forwardRef, useMemo, type ComponentProps } from "react";

type RefLinkProps = ComponentProps<typeof NextLink>;
const REF_QUERY_KEY = "ref";

function isHexAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function resolveCurrentRef(
  searchParams: ReturnType<typeof useSearchParams>,
): [string, string] | null {
  const ref = searchParams.get(REF_QUERY_KEY)?.trim();
  if (ref && isHexAddress(ref)) {
    return [REF_QUERY_KEY, ref];
  }

  return null;
}

function appendRefToHref(href: string, refEntry: [string, string] | null): string {
  if (!refEntry || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }

  const [queryKey, queryValue] = refEntry;
  const [hrefWithoutHash, hash = ""] = href.split("#");
  const [pathname, queryString = ""] = hrefWithoutHash.split("?");
  const query = new URLSearchParams(queryString);
  const hasRef = query.has(REF_QUERY_KEY);

  if (hasRef) {
    return href;
  }

  query.set(queryKey, queryValue);
  const nextQuery = query.toString();

  return `${pathname}${nextQuery ? `?${nextQuery}` : ""}${hash ? `#${hash}` : ""}`;
}

const Link = forwardRef<HTMLAnchorElement, RefLinkProps>(function Link({ href, ...props }, ref) {
  const searchParams = useSearchParams();
  const refEntry = resolveCurrentRef(searchParams);

  const nextHref = useMemo(() => {
    if (typeof href !== "string") {
      return href;
    }

    return appendRefToHref(href, refEntry);
  }, [href, refEntry]);

  return <NextLink ref={ref} href={nextHref} {...props} />;
});

export default Link;
