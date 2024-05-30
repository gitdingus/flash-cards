'use client';
import { useEffect, useState } from 'react';
import CreateAccountForm from './CreateAccountForm';
import LoginForm from './LoginForm';
import { signOut } from 'next-auth/react';

interface User {
  email: string,
}

interface Props {
  user: User, 
  expires: string,
}

type LoginState = "create" | "login" | "loggedin";

export default function Authentication({ session }: any) {
  const [ loginState, setLoginState ] = useState<LoginState>('login');
  
  useEffect(() => {
    if (session) {
      setLoginState('loggedin');
    } else {
      setLoginState('login');
    }
  }, [session]);

  switch (loginState) {
    case "create":
      return ( 
        <CreateAccountForm>
          <div>
            Or
            <button onClick={() => setLoginState('login')}>Login</button>
          </div>
        </CreateAccountForm>
      )
    case "login":
      return (
        <LoginForm>
          <div>
            Or
            <button onClick={() => setLoginState('create')}>Create Account</button>
          </div>
        </LoginForm>
      )
    case "loggedin":
      return (
        <div>
          <p>Logged in</p>
          <button onClick={async () => { await signOut() }}>Logout</button>
        </div>
      )
  }
}