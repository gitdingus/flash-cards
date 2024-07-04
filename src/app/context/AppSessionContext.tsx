'use client';

import { Session } from 'next-auth';
import { ReactNode, createContext } from 'react';
import { SessionContext } from '@/app/context/SessionContext';

interface Config {
  session: Session | null,
  children: ReactNode,
}

export default function AppSessionContext({ session, children }: Config) {
  return (
    <SessionContext.Provider value={session}>
      <div>
        {children}
      </div>
    </SessionContext.Provider>
  )
}
