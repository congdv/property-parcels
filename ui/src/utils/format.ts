export const formatCounty = (c?: string | null) => {
  if (!c) return '';
  return String(c)
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
};
