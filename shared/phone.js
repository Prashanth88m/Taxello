const phoneProfiles = [
  { code: "971", min: 9, max: 9, pattern: /^[2-9]\d{8}$/ },
  { code: "91", min: 10, max: 10, pattern: /^[6-9]\d{9}$/ },
  { code: "44", min: 9, max: 10, pattern: /^[1-9]\d{8,9}$/ },
  { code: "61", min: 9, max: 9, pattern: /^[2-9]\d{8}$/ },
  { code: "65", min: 8, max: 8, pattern: /^[3689]\d{7}$/ },
  { code: "1", min: 10, max: 10, pattern: /^[2-9]\d{9}$/ },
];

export function normalizePhone(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\+[\d\s()-]+$/.test(trimmed)) return null;

  const compact = trimmed.replace(/[\s()-]/g, "");
  const profile = phoneProfiles.find(({ code }) => compact.startsWith(`+${code}`));
  if (!profile) return null;

  const nationalNumber = compact.slice(profile.code.length + 1);
  if (nationalNumber.length < profile.min || nationalNumber.length > profile.max) return null;
  if (!profile.pattern.test(nationalNumber)) return null;

  return `+${profile.code} ${nationalNumber}`;
}

export function phoneLinkNumber(value) {
  const normalized = normalizePhone(value);
  return normalized ? normalized.replace(/\D/g, "") : null;
}
