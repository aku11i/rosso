export function slugifyName(value: string) {
  const normalized = value.trim().toLowerCase();
  const dashed = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return dashed.length > 0 ? dashed : 'source';
}
