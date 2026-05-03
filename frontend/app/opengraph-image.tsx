import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Pragmara — RAG-as-a-Service for Technical Documentation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0B0F 0%, #13141A 50%, #0A0B0F 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#F0F0F5",
              letterSpacing: "-2px",
            }}
          >
            Pragmara
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#8B8C9E",
              maxWidth: "600px",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            RAG-as-a-Service for Technical Documentation
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {["FastAPI", "Next.js", "Qdrant", "Groq"].map((tech) => (
              <div
                key={tech}
                style={{
                  padding: "8px 16px",
                  borderRadius: "99px",
                  background: "rgba(108, 99, 255, 0.1)",
                  color: "#6C63FF",
                  fontSize: "16px",
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
