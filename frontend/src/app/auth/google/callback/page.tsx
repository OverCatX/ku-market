"use client";

import { useEffect } from "react";
import { API_BASE } from "@/config/constants";

export default function GoogleCallbackPage() {
  useEffect(() => {
    // This page receives the OAuth callback from backend
    // Backend redirects here, then we fetch JSON from backend callback endpoint
    
    // Check if we're in a popup window
    if (window.opener) {
      // Check for error in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");
      
      if (error) {
        // Send error to parent window
        window.opener?.postMessage(
          {
            type: "GOOGLE_OAUTH_ERROR",
            error: decodeURIComponent(error),
          },
          window.location.origin
        );
        window.close();
        return;
      }
      
      // Fetch OAuth data from backend (stored in cookie after redirect)
      fetch(`${API_BASE}/api/auth/google/callback/data`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        credentials: "include", // Important: include cookies
      })
        .then(async (res) => {
          // Check content-type before parsing
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            console.error("Expected JSON but got:", text.substring(0, 100));
            throw new Error("Server returned non-JSON response");
          }
          
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || "Authentication failed");
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.token && data.user) {
            // Send success to parent window
            window.opener?.postMessage(
              {
                type: "GOOGLE_OAUTH_SUCCESS",
                token: data.token,
                user: data.user,
              },
              window.location.origin
            );
            window.close();
          } else if (data.error) {
            // Send error to parent window
            window.opener?.postMessage(
              {
                type: "GOOGLE_OAUTH_ERROR",
                error: data.error,
              },
              window.location.origin
            );
            window.close();
          }
        })
        .catch((err) => {
          console.error("Error fetching OAuth response:", err);
          const errorMessage = err instanceof Error ? err.message : "Authentication failed. Please try again.";
          window.opener?.postMessage(
            {
              type: "GOOGLE_OAUTH_ERROR",
              error: errorMessage,
            },
            window.location.origin
          );
          window.close();
        });
    } else {
      // Not in popup, redirect to login
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#69773D] border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg">Completing login...</p>
      </div>
    </div>
  );
}

