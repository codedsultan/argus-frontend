"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("argus: global error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#f4f0e6",
          color: "#17241d",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#425146",
            }}
          >
            Argus Field Supply
          </p>
          <h1
            style={{
              fontFamily:
                'ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif',
              fontSize: "2.5rem",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: "1rem 0 0",
            }}
          >
            The field guide could not load.
          </h1>
          <p style={{ color: "#425146", lineHeight: 1.7, marginTop: "1rem" }}>
            A page-level error interrupted the app. Try again, or return to the
            home page.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              marginTop: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: "999px",
                background: "#1c3a2c",
                color: "#f4f0e6",
                padding: "0.8rem 1.4rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                borderRadius: "999px",
                border: "1px solid #d8d0c0",
                color: "#17241d",
                padding: "0.8rem 1.4rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Home
            </a>
          </div>
          {error.digest ? (
            <p
              style={{
                marginTop: "1.5rem",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#5e7a61",
              }}
            >
              Reference {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
