/**
 * Utility function to retry a promise-based function with delay between attempts
 * 
 * @param fn Function to retry
 * @param retries Maximum number of retries
 * @param delay Delay between retries in ms
 * @returns Promise that resolves with the result of the function or rejects after max retries
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay);
  }
} 