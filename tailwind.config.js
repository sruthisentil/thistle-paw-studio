module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f0f0f",
        panel: "#181818",
        raised: "#1f1f1f",
        line: "#2a2a2a",
        line2: "#343434",
        fg: "#ededed",
        muted: "#8b8b8b",
        faint: "#6a6a6a",
        brand: "#3ecf8e",
        amber: "#f0a92c",
        danger: "#f45b5b",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
