import type { Metadata } from 'next';
import { verifiedSources as data } from '@/data/verifiedSources';
import '@fontsource/fira-code/400.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import PortfolioAnalytics from '@/components/PortfolioAnalytics';
import './globals.css';
import '../components/RetroNameTerminal.css';
export const metadata: Metadata = {title:`${data.candidate.name} | ${data.candidate.target}`,description:data.candidate.summary};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PortfolioAnalytics/>{children}</body></html>}
