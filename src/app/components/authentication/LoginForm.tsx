'use client';

import { signIn } from '@/actions/auth-actions';
import { useState } from 'react';

export default function LoginForm({ children }: { children?: React.ReactNode }) {
  // const [ message, dispatch ] = useFormState(signIn, '');
  const [ formError, setFormError ] = useState('');

  return (
    <div>
      <p>Log in</p>
      <form action={async (formData) => {
        try {
          await signIn(formData);
        } catch (err) {
          const { message } = err as Error;
          setFormError(message);
        }
      }}>
        <div>
          <label>
            Username
            <input type="text" name="username" />
          </label>
        </div>
        <div>
          <label>
            Password
            <input type="password" name="password" />
          </label>
        </div>
        <p>{formError}</p>
        <button type="submit">Log in</button>
      </form>
      { children }
    </div>

  )
}