import Link from 'next/link';
import Authentication from '@/app/components/authentication/Authentication';
import { auth } from '@/auth';
import AppSessionContext from './context/AppSessionContext';
import '@/app/styles/main-layout.css';

export const metadata = {
  title: {
    template: 'Flash Cards | %s',
    default: 'Flash Cards',
  },
  description: 'Flash Card app',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              {
                session?.user && 
                <li>
                  <Link href="/cards/create-set">Create Set</Link>
                </li>
              }
              <li>
                <a href="/cards">View Cards</a>
              </li>
            </ul>
          </nav>
          <div>
            <Authentication session={session} />
          </div>
        </header>
        <AppSessionContext session={session}>
          {children}
        </AppSessionContext>
      </body>
    </html>
  )
}
