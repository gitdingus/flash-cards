import { auth } from '@/auth';
import ChangePasswordForm from "@/app/components/account-tools/ChangePasswordForm";

export default async function UserSettings() { 
  const session = await auth();

  if (!session) {
    return <div>Unauthorized</div>
  }
  
  return (
    <div>
      <ChangePasswordForm />
      <form>
        <label>
          New Email 
          <input type="email" name="new-email" />
        </label>
        <button type="submit">Change Email</button>
      </form>
    </div>
  )
}