import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Spectrate",
  description: "Next.js app with Spectrate branding",
  icons: {
    icon: [
      { url: "/spectrate-logo.ico", type: "image/x-icon", sizes: "32x32" },
    ],
    apple: "/spectrate-logo.png", // optional iOS app icon
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        {children}
      </body>
    </html>
  );
}
