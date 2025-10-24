import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';

import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'Music Club - IIITDM Kancheepuram',
  description: 'Official website of the Music Club at IIITDM Kancheepuram, Chennai, India',
  icons: {
    icon: '/music_club_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <AuthProvider>
          < Navbar />
          {children}
          < Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
