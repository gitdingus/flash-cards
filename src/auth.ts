import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from '@/utils/passwords';
import { getSensitiveUser } from '@/app/lib/accounts';

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

        const userRow = await getSensitiveUser(credentials.username);

        if (!userRow) {
          throw new CredentialsSignin('Invalid username and/or password');
        }

        const user = {
          userId: userRow.id,
          username: userRow.username,
          email: userRow.email,
          salt: userRow.salt,
          passwordhash: userRow.passwordhash,
        }

        const allowed = verifyPassword(credentials.password, user.salt, user.passwordhash);
        return allowed ? user : null;
      },
    })
  ],
  callbacks: {
    async jwt(args) {
      const { token, user, trigger, session } = args;

      if (user) {
        token.userId = user.userId;
        token.username = user.username;
      }

      if (trigger === 'update' && session.email) {
        token.email = session.email;
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