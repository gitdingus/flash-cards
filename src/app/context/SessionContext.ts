import { Session } from 'next-auth';
import { createContext } from 'react';

const SessionContext = createContext<Session | null>(null);

export { SessionContext }