export type AppLocale = "en" | "ar";

export function isArabicLocale(locale: AppLocale) {
  return locale === "ar";
}

export function localePath(locale: AppLocale, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === "ar") {
    if (normalizedPath === "/") {
      return "/ar";
    }

    if (normalizedPath.startsWith("/ar/")) {
      return normalizedPath;
    }

    return `/ar${normalizedPath}`;
  }

  return normalizedPath;
}

export function oppositeLocale(locale: AppLocale): AppLocale {
  return locale === "ar" ? "en" : "ar";
}
