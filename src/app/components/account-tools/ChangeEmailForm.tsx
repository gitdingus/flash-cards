'use client';
import { useCallback, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { changeEmail } from '@/actions/account-actions';
import { useSession } from 'next-auth/react';

export default function ChangeEmailForm() {
  const { data: session, update } = useSession();
  const [formState, formAction] = useFormState(changeEmail, {});

  useEffect(() => {
    if (formState?.form?.match(/updated successfully/)) {
      if (formState?.data?.email) {
        update({ email: formState.data.email });
      }
    }
  }, [formState]); // Adding update to dependencies causes infinite loop

  return (
  <form action={formAction}>
    <fieldset>
      <legend>Change Email</legend>
      {
        formState.form &&
        <p>{formState.form}</p>
      }
      
      <p>Current Email: {session?.user.email}</p>
      <label>
        New Email
        <input type="email" name="new-email" />
      </label>
      {
        formState.newEmail &&
        <p>{formState.newEmail}</p>
      }
      <button type="submit">Change Email</button>
    </fieldset>
  </form>
  )
}