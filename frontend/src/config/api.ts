export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

type SignupData = {
  name: string;
  kuEmail: string;
  password: string;
};

type SignupResponse = {
  message: string;
  userId?: string;
};

type SignInData = {
    kuEmail: string;
    password: string;
  };
  
  type SignInResponse = {
    message: string;
    token?: string;
    userId?: string;
  };

export async function signup(data: SignupData): Promise<SignupResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json: SignupResponse & { message?: string } = await res.json();

    if (!res.ok) throw new Error(json.message || "Signup failed");
    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}
  
export async function signin(data: SignInData): Promise<SignInResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      const json: SignInResponse & { message?: string } = await res.json();
  
      if (!res.ok) throw new Error(json.message || "Sign in failed");
  
      return json;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      } else {
        throw new Error("Something went wrong");
      }
    }
  }