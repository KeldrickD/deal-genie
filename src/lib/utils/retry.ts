/**
 * Retries an async function with exponential backoff.
 * @param fn      Function that returns a Promise<T>
 * @param retries Number of retry attempts (default 3)
 * @param delay   Initial delay in ms (default 500)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn(`Retrying after error: ${err}. ${retries} retries left.`);
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2);
  }
} 