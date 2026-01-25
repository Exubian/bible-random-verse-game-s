function getType(v) {
  if (v === null) return "null";
  if (typeof v !== "object") return typeof v;
  return Object.prototype.toString.call(v).slice(8, -1);
}

function isNumeric(v) {
  return /^\d+$/.test(v);
}

function isNumericFast(v) {
  if (v.length === 0) return false;
  for (let i = 0; i < v.length; i++) {
    const c = v.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return true;
}

function isPlainObject(obj) {
  return getType(obj) === 'Object';
}

function isPlainObjectFast(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

module.exports = {
  getType,
  isNumeric,
  isNumericFast,
  isPlainObject,
  isPlainObjectFast,
};
