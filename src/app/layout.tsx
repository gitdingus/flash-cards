import Link from 'next/link';

export const metadata = {
  title: {
    template: 'Flash Cards | %s',
    default: 'Flash Cards',
  },
  description: 'Flash Card app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div>
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
        </div>
        {children}
      </body>
    </html>
  )
}
