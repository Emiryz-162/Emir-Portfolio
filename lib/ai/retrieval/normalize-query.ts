const combiningMarks = /[\u0300-\u036f]/g;

export function normalizeQuery(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFKD")
    .replace(combiningMarks, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9#+.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeQuery(value: string) {
  const normalized = normalizeQuery(value);
  if (!normalized) return [];

  return [
    ...new Set(
      normalized
        .split(/[\s-]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2),
    ),
  ];
}
