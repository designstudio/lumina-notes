import React from "react";

type RuntimeErrorBoundaryState = {
  error: Error | null;
};

export class RuntimeErrorBoundary extends React.Component<React.PropsWithChildren, RuntimeErrorBoundaryState> {
  state: RuntimeErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): RuntimeErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("RuntimeErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "32px",
          background: "#fff8f7",
          color: "#25161b",
          fontFamily: "\"Segoe UI\", Arial, sans-serif"
        }}
      >
        <div
          style={{
            maxWidth: "920px",
            margin: "0 auto",
            padding: "24px",
            border: "1px solid #f2c9d2",
            borderRadius: "20px",
            background: "#ffffff",
            boxShadow: "0 18px 40px rgba(98, 28, 51, 0.08)"
          }}
        >
          <h1 style={{ margin: "0 0 12px", fontSize: "28px", lineHeight: 1.15 }}>
            The app hit a runtime error
          </h1>
          <p style={{ margin: "0 0 18px", color: "#6f4450", fontSize: "15px", lineHeight: 1.5 }}>
            The app crashed during startup. The details below should make the real cause visible instead of leaving a blank screen.
          </p>
          <pre
            style={{
              margin: 0,
              padding: "16px",
              borderRadius: "14px",
              background: "#1f1720",
              color: "#f8ecf0",
              fontSize: "13px",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}
          >
            {this.state.error.stack || this.state.error.message}
          </pre>
        </div>
      </main>
    );
  }
}
