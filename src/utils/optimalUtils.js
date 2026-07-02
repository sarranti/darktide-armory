export function sanitizeClassKeys(optimalString = "", allowedKeys = []) {
  const up = (optimalString || "").toUpperCase();
  const letters = (up.match(/[A-Z]/g) || []).filter((ch) =>
    allowedKeys.includes(ch),
  );
  return Array.from(new Set(letters)).sort().join("");
}

export function isOptimalValue(optimalString = "", activeClass, itemType, allowedKeys = []) {
  if (itemType === "Curio") {
    return sanitizeClassKeys(optimalString, allowedKeys).includes(activeClass);
  }
  return (optimalString || "").toUpperCase() === "TRUE";
}

export function toggleOptimalValue(optimalString = "", activeClass, itemType, allowedKeys = []) {
  if (itemType === "Curio") {
    const sanitized = sanitizeClassKeys(optimalString, allowedKeys);
    const set = new Set((sanitized || "").split("").filter(Boolean));
    if (set.has(activeClass)) set.delete(activeClass);
    else set.add(activeClass);
    return Array.from(set).sort().join("");
  }

  // Non-curio: toggle boolean-ish TRUE/FALSE
  const up = (optimalString || "").toUpperCase();
  return up === "TRUE" ? "FALSE" : "TRUE";
}

export default {
  sanitizeClassKeys,
  isOptimalValue,
  toggleOptimalValue,
};
