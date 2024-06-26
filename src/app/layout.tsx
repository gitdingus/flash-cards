import Link from 'next/link';
import Authentication from '@/app/components/Authentication';
import NotificationWidget from '@/app/components/notification-tools/NotificationWidget';
import { auth } from '@/auth';

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
              <li>
                <Link href="/cards/create">Create Card</Link>
              </li>
              <li>
                <Link href="/cards/create-set">Create Set</Link>
              </li>
              <li>
                <a href="/cards">View Cards</a>
              </li>
            </ul>
          </nav>
          <div>
            <Authentication session={session} />
            {
              session &&
              <NotificationWidget session={session} />
            }
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
