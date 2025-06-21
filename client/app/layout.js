import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ToastProvider from "@/components/ui/toast";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "AmarVoice - Empowering Citizens with Transparent Civic Engagement",
  description: "Submit your civic complaints via text or voice in Bengali or English. AI-powered categorization, real-time tracking, and transparent resolution.",
  keywords: "civic engagement, complaints, Bengali, English, AI, voice recognition",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link 
          href="https://fonts.maateen.me/bensen-handwriting/font.css" 
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { 
                background-color: rgb(37 37 37); 
                color: rgb(250 250 250);
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    // Default to dark theme for new users
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.add('dark'); // Force dark as default
                    }
                  }
                } catch (e) {
                  // Fallback to dark theme
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange={true}
          storageKey="theme"        >
          <ToastProvider>
            {children}
          </ToastProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
