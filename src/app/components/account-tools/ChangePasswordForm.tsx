'use client';
import { useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import { changePassword } from '@/actions/account-actions';

export default function ChangePasswordForm() {
  const [formState, formAction] = useFormState(changePassword, {});
  const form = useRef<HTMLFormElement>(null);
  const currentPassword = useRef<HTMLInputElement>(null);

  useEffect(() => {
    form.current?.reset();
    currentPassword.current?.focus();
  }, [formState]);

  return (
    <form action={formAction} ref={form}>
      <fieldset>
        <legend>Change Password</legend>
        {
          formState.form &&
          <p>{formState.form}</p>
        }
        <label>
          Current password
          <input type="password" name="current-password" ref={currentPassword}/>
        </label>
        {
          formState.currentPassword &&
          <p>{formState.currentPassword}</p>
        }
        <label>
          New Password
          <input type="password" name="new-password" />
        </label>
        {
          formState.newPassword &&
          <p>{formState.newPassword}</p>
        }
        <label>
          Confirm Password
          <input type="password" name="confirm-password" />
        </label>
        {
          formState.confirmPassword &&
          <p>{formState.confirmPassword}</p>
        }
        <button type="submit">Change Password</button>
      </fieldset>
    </form>
  )
}