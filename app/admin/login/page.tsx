"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
      } else {
        // Token received - save it and redirect
        if (data.token) {
          // Token is already set in cookie by API, but we can also save in localStorage if needed
          localStorage.setItem("admin_token", data.token);
        }
        
        // Redirect to dashboard
        setLoading(false);
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a 0%, #020617 100%)",
        position: "relative",
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 50,
                height: 50,
                border: "4px solid #1f2937",
                borderTop: "4px solid #D4AF37",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1.5rem",
              }}
            />
            <div style={{ color: "#e5e7eb", fontSize: 16, fontWeight: 500 }}>
              Signing in...
            </div>
            <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>
              Please wait
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          padding: "3rem",
          borderRadius: 12,
          background: "#020617",
          border: "1px solid #1f2937",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#D4AF37", marginBottom: 8 }}>
            TORONTO LIMO
          </h1>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>Admin Login</p>
        </div>

        {/* Default Credentials Info */}
        <div
          style={{
            background: "#1f2937",
            border: "1px solid #374151",
            borderRadius: 6,
            padding: "0.75rem",
            marginBottom: "1.5rem",
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          <div style={{ marginBottom: 4, fontWeight: 500, color: "#D4AF37" }}>
            Default Credentials:
          </div>
          <div style={{ marginBottom: 2 }}>
            <strong>Username:</strong> admin
          </div>
          <div>
            <strong>Password:</strong> admin123
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 500,
                color: "#e5e7eb",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#0a0a0a",
                color: "#e5e7eb",
                fontSize: 14,
              }}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 500,
                color: "#e5e7eb",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#0a0a0a",
                color: "#e5e7eb",
                fontSize: 14,
              }}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div
              style={{
                background: "#7f1d1d",
                color: "#fca5a5",
                padding: "0.75rem",
                borderRadius: 6,
                marginBottom: "1rem",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#374151" : "#D4AF37",
              color: loading ? "#9ca3af" : "#000",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid #9ca3af",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` }} />
    </div>
  );
}
