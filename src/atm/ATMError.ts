export class ATMError extends Error {
  readonly isATMError = true;
  constructor(message?: string) {
    super(message);
  }
}

export function isATMError(error: unknown): error is ATMError {
  if (error && (error as Error).message && ((error as ATMError).isATMError)) {
    return true;
  }
  return false;
}