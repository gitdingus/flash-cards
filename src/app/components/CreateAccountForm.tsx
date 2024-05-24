'use client';

import { createAccount } from '@/actions/auth-actions';
import { useFormState } from 'react-dom';

export default function CreateAccountForm({ children }: { children?: React.ReactNode }) {
  const [ messages, dispatch ] = useFormState(createAccount, []);

  function getFieldMessages(fieldName: string) {
    return messages
      .filter(({ field }) => field === fieldName)
      .map(({ message }, index) => (
        <p key={index}>{ message }</p>
      ))
  }
  return (
    <div>
      <p>Create new user</p>
      <form action={dispatch}>
        {
          getFieldMessages('form')
        }
        <div>
          <label>
            Username
            <input type="text" name="username" />
          </label>
          {
            getFieldMessages('username')
          }
        </div>
        <div>
          <label>
            Password
            <input type="password" name="password" />
          </label>
          {
            getFieldMessages('password')
          }
        </div>
        <div>
          <label>
            Confirm Password
            <input type="password" name="confirm_password" />
          </label>
          {
            getFieldMessages('confirm_password')
          }
        </div>
        <div>
          <label>
            Email
            <input type="email" name="email" />
          </label>
          {
            getFieldMessages('email')
          }
        </div>
        <button type="submit">Create Account</button>
      </form>
      { children }
    </div>
  )
}