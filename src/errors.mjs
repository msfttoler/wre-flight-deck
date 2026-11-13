export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function requireThat(condition, status, code, message) {
  if (!condition) throw new AppError(status, code, message);
}

export function fields(value, allowed, required = allowed) {
  requireThat(value !== null && typeof value === 'object' && !Array.isArray(value),
    400, 'INVALID_BODY', 'Expected a JSON object.');
  requireThat(Object.keys(value).every(key => allowed.includes(key))
    && required.every(key => Object.hasOwn(value, key)),
  400, 'INVALID_BODY', 'The request has missing or unsupported fields.');
}

export function integer(value, minimum, maximum, name) {
  requireThat(Number.isSafeInteger(value) && value >= minimum && value <= maximum,
    400, 'INVALID_VALUE', `${name} must be an integer from ${minimum} to ${maximum}.`);
}
