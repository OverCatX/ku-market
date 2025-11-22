"use client";

import { useEffect } from "react";

export default function GoogleCallbackPage() {
  useEffect(() => {
    // This page receives the OAuth callback from backend
    // Backend redirects here with token and user data in URL query parameters
    
    // Check if we're in a popup window
    if (window.opener) {
      // Read OAuth data from URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");
      const token = urlParams.get("token");
      const userParam = urlParams.get("user");
      
      // Check for error first
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

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Send success to parent window
          window.opener?.postMessage(
            {
              type: "GOOGLE_OAUTH_SUCCESS",
              token: decodeURIComponent(token),
              user: user,
            },
            window.location.origin
          );
          window.close();
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          window.opener?.postMessage(
            {
              type: "GOOGLE_OAUTH_ERROR",
              error: "Failed to parse authentication data. Please try again.",
            },
            window.location.origin
          );
          window.close();
        }
      } else {
        // Missing token or user data
        window.opener?.postMessage(
          {
            type: "GOOGLE_OAUTH_ERROR",
            error: "Authentication data not found. Please try again.",
          },
          window.location.origin
        );
        window.close();
      }
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

