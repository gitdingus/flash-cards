import NextAuth, { AuthError, CredentialsSignin } from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from '@/utils/passwords';
import { getUser } from '@/app/lib/data';

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

        const user = await getUser(credentials.username);

        if (!user) {
          return null;
        }

        const allowed = verifyPassword(credentials.password, user.salt, user.passwordhash);
        return allowed ? user : null;
      },
    })
  ],
});