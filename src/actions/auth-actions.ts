'use server';
import { signIn as authSignIn} from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { AuthError } from 'next-auth';
import { 
  duplicateUsername, 
  emailUsed,
  insertAccount,
} from '@/app/lib/data';

interface FormError {
  field: string,
  message: string,
}

interface CreateAccountState extends Array<FormError> {};

export async function createAccount(prevState: CreateAccountState, formData: FormData) {
  const messages: CreateAccountState = [];
  const username = formData.get('username')?.toString();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirm_password')?.toString();
  const email = formData.get('email')?.toString();

  if (!username || username.length < 5) {
    messages.push({ field: 'username', message: 'Username must be 5 or more characters' });
  } else if (await duplicateUsername(username) === true) {
    messages.push({ field: 'username', message: `Username ${username} is already taken` });
  }

  if (!password || password.length < 5) {
    messages.push({ field: 'password', message: 'Password must be 5 or more characters' });
  } else if (password !== confirmPassword) {
    messages.push({ field: 'confirm_password', message: 'Passwords do not match' });
  }


  if (!email) {
    messages.push({ field: 'email', message: 'Must provide an email address' });
  } else if (await emailUsed(email)) {
    messages.push({ field: 'email', message: 'Email address is already in use' });
  }

  if (messages.length === 0 && username && password && email) {
    insertAccount(username, password, email);
    messages.push({ field: 'form', message: 'User created successfully' })
  }

  return messages;
}

export async function signIn(formData: FormData) {
  if (!formData.get('username') || !formData.get('password')) {
    throw new Error('Please provide username and password');
  }
  
  try {
    await authSignIn('credentials', formData);
  } catch (err) {
    if (isRedirectError(err)) {
      throw err; // 
    }

    const { type } = err as AuthError;

    switch (type) {
      case 'CredentialsSignin':
        throw new Error('Invalid username and/or password');
      default:
        throw new Error('Something went wrong');
    }
  }

  return 'Login successful';
}