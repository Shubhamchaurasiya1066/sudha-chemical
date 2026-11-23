import "./globals.css";

export const metadata = {
  title: {
    default: "Sudha Chemical Company | Industrial Chemicals",
    template: "%s | Sudha Chemical Company",
  },
  description:
    "Explore industrial chemicals supplied by Sudha Chemical Company, Gwalior.",
  metadataBase: new URL("https://sudhachemicalcompany.com"),
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
