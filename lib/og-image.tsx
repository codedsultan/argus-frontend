export const OG_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_CONTENT_TYPE = "image/png";

export const OG_ALT =
  "Argus Field Supply — a catalog-grounded AI field guide for optics and field gear.";

export function renderOgImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        background: "#f4f0e6",
        padding: "64px",
        color: "#17241d",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-120px",
          top: "80px",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          border: "1px solid rgba(23,36,29,0.12)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-40px",
          top: "160px",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          border: "1px solid rgba(23,36,29,0.16)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "44px",
          top: "250px",
          width: "92px",
          height: "92px",
          borderRadius: "50%",
          background: "#c8892f",
          opacity: 0.85,
          display: "flex",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "15px",
            background: "#1c3a2c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "19px",
              borderRadius: "50%",
              border: "2px solid #f4f0e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#c8892f",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "22px",
              letterSpacing: "0.18em",
            }}
          >
            ARGUS
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: "10px",
              letterSpacing: "0.24em",
              color: "#425146",
              marginTop: "4px",
            }}
          >
            FIELD SUPPLY
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxWidth: "860px",
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: "14px",
            letterSpacing: "0.2em",
            color: "#c8892f",
          }}
        >
          AI FIELD GUIDE
        </span>
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "78px",
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
          }}
        >
          Know the field before you go.
        </span>
        <span
          style={{
            fontSize: "24px",
            lineHeight: 1.5,
            color: "#425146",
            maxWidth: "760px",
          }}
        >
          Ask about optics, field essentials, and current offers. Every answer
          is grounded in the field catalog.
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #d8d0c0",
          paddingTop: "24px",
          fontSize: "16px",
          color: "#425146",
        }}
      >
        <span>argus.xurl.fyi</span>
        <span>Catalog-grounded · Curated preview</span>
      </div>
    </div>
  );
}
