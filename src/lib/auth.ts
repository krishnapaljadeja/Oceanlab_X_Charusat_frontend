import axios from "axios";

const AUTH_STORAGE_KEY = "oceanlab_auth_session";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export type AuthApiResult = {
  error?: string;
  needsConfirmation?: boolean;
};

export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.accessToken || !parsed?.user?.id || !parsed?.user?.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession | null): void {
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthHeaders(): Record<string, string> {
  const session = getStoredSession();
  if (!session?.accessToken) return {};
  return { Authorization: `Bearer ${session.accessToken}` };
}

export async function signInWithBackend(
  email: string,
  password: string,
): Promise<{ result: AuthApiResult; session?: AuthSession }> {
  try {
    const response = await axios.post<{ success: true; session: AuthSession }>(
      `${BACKEND_URL}/api/auth/login`,
      { email, password },
    );
    return { result: {}, session: response.data.session };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: string } | undefined)?.error ||
        "Failed to sign in.";
      return { result: { error: message } };
    }
    return { result: { error: "Failed to sign in." } };
  }
}

export async function signUpWithBackend(
  email: string,
  password: string,
): Promise<{ result: AuthApiResult; session?: AuthSession }> {
  try {
    const response = await axios.post<
      { success: true; session: AuthSession } | { success: true; needsConfirmation: true }
    >(
      `${BACKEND_URL}/api/auth/signup`,
      { email, password },
    );

    if ("session" in response.data) {
      return { result: {}, session: response.data.session };
    }

    return { result: { needsConfirmation: true } };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: string } | undefined)?.error ||
        "Failed to create account.";
      return { result: { error: message } };
    }
    return { result: { error: "Failed to create account." } };
  }
}

export async function establishSessionFromAccessToken(
  accessToken: string,
): Promise<AuthSession | null> {
  try {
    const response = await axios.get<{ success: true; user: AuthUser }>(
      `${BACKEND_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return {
      accessToken,
      user: response.data.user,
    };
  } catch {
    return null;
  }
}

export async function signOutWithBackend(): Promise<AuthApiResult> {
  try {
    const headers = getAuthHeaders();
    await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { headers });
    return {};
  } catch {
    return {};
  }
}

export async function validateSessionWithBackend(
  session: AuthSession,
): Promise<AuthSession | null> {
  try {
    const response = await axios.get<{ success: true; user: AuthUser }>(
      `${BACKEND_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    return {
      accessToken: session.accessToken,
      user: response.data.user,
    };
  } catch {
    return null;
  }
}
