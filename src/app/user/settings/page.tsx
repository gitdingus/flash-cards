import { auth } from '@/auth';
import ChangePasswordForm from "@/app/components/account-tools/ChangePasswordForm";
import ChangeEmailForm from '@/app/components/account-tools/ChangeEmailForm';

export default async function UserSettings() { 
  const session = await auth();

  if (!session) {
    return <div>Unauthorized</div>
  }
  
  return (
    <div>
      <ChangePasswordForm />
      <ChangeEmailForm />
    </div>
  )
}