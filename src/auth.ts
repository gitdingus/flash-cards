import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from '@/utils/passwords';
import { getUser } from '@/app/lib/data';

declare module 'next-auth' {
  interface Session {
    user: {
      userId: string,
      username: string,
    } & DefaultSession['user']
  }

  interface User {
    userId: string,
    username: string,
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {   
        if (
          typeof credentials.username !== 'string' 
          || typeof credentials.password !== 'string'
        ) {
          return null;
        }

        const userRow = await getUser(credentials.username);
        const user = {
          userId: userRow.id,
          username: userRow.username,
          email: userRow.email,
          salt: userRow.salt,
          passwordhash: userRow.passwordhash,
        }
        if (!user) {
          return null;
        }

        const allowed = verifyPassword(credentials.password, user.salt, user.passwordhash);
        return allowed ? user : null;
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
        token.username = user.username;
      }

      return token;
    },
    async session({ session, token }) {
      // better way to fix this typescript error???
      session.user.userId = token.userId as string;
      session.user.username = token.username as string;

      return session;
    },
  },
});