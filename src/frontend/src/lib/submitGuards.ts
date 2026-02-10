let lastSubmitHash: string | null = null;
let lastSubmitTime = 0;
const DUPLICATE_WINDOW_MS = 2000;

export function preventDuplicateSubmit(formData: any): boolean {
  const now = Date.now();
  const hash = JSON.stringify(formData);

  if (hash === lastSubmitHash && now - lastSubmitTime < DUPLICATE_WINDOW_MS) {
    return false;
  }

  lastSubmitHash = hash;
  lastSubmitTime = now;
  return true;
}
