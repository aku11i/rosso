export function slugifyName(value: string) {
  const normalized = value.trim().toLowerCase();
  const dashed = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!dashed) {
    throw new Error('Value cannot be slugified to a non-empty string');
  }
  return dashed;
}
