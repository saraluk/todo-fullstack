/**
 * Custom error class for authentication errors
 * Thrown when API returns 401 (Unauthorized) or 403 (Forbidden)
 */
export class AuthenticationError extends Error {
  constructor(message: string = "Session expired. Please login again.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Checks if a response indicates an authentication error
 * @param response - The fetch Response object
 * @returns true if response is 401 or 403
 */
export function isAuthenticationError(response: Response): boolean {
  return response.status === 401 || response.status === 403;
}

/**
 * Handles API response errors, throwing AuthenticationError for auth failures
 * @param response - The fetch Response object
 * @param defaultMessage - Default error message if response doesn't have one
 * @throws AuthenticationError if response is 401 or 403
 * @throws Error for other non-ok responses
 */
export async function handleApiError(
  response: Response,
  defaultMessage: string = "Request failed"
): Promise<never> {
  if (isAuthenticationError(response)) {
    throw new AuthenticationError("Session expired. Please login again.");
  }

  // Try to get error message from response
  let errorMessage = defaultMessage;
  try {
    const data = await response.json();
    errorMessage = data.message || defaultMessage;
  } catch {
    // If response isn't JSON, use default message
    errorMessage = `${defaultMessage}: ${response.status}`;
  }

  throw new Error(errorMessage);
}
