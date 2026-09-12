import "./globals.css";

export const metadata = {
  title: "Thistle & Paw — Database Studio",
  description: "Pharmacy platform database operations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
