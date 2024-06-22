'use server';
import { auth } from '@/auth';
import { getSensitiveUser } from '@/app/lib/accounts';
import { sql } from '@vercel/postgres';
import { verifyPassword, saltHash } from '@/utils/passwords';
import ChangePasswordForm from "@/app/components/account-tools/ChangePasswordForm";
import { ChangeEvent } from 'react';

export async function changePassword(initialState: ChangePasswordFormState, formData: FormData) {
  const session = await auth();

  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response: ChangePasswordFormState = {};

  const currentPassword = formData.get('current-password') as string;
  const newPassword = formData.get('new-password') as string;
  const confirmPassword = formData.get('confirm-password') as string;

  if (!currentPassword) {
    response.currentPassword = 'Please enter your password';
  }
  
  if (!newPassword) {
    response.newPassword = 'Please enter a new password';
  }

  if (!confirmPassword) {
    response.confirmPassword = 'Must confirm password';
  }

  if (newPassword !== confirmPassword) {
    response.confirmPassword = 'Passwords do not match';
  }

  
  if (Object.keys(response).length > 0) {
    return response;
  }

  const user = await getSensitiveUser(session.user.username);

  if (!user) {
    throw new Error('Can not find user');
  }

  if (currentPassword && !verifyPassword(currentPassword, user.salt, user.passwordhash)) {
    response.currentPassword = 'Invalid credentials';
    return response;
  }

  const { salt, hash } = saltHash(newPassword);

  try {
    await sql`
      UPDATE users 
      SET salt = ${salt}, passwordhash = ${hash} 
      WHERE id = ${user.id};
    `;
  } catch (err) {
    response.form = 'There has been an error processing your request';
    return response;
  }

  response.form = 'Password has been changed successfully';

  return response;
}