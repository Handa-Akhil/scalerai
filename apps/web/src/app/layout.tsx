import "./globals.css";

export const metadata = {
  title: "Trello Clone",
  description: "Production-ready Trello clone starter"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
