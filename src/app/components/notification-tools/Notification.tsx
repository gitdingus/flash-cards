import LinkMarkDownTransformer from "@/app/components/markdown-components/LinkMarkDownTransformer"
import { headers } from "next/headers";
interface NotificationProps {
  notification: NotificationBase,
} 
export default function Notification({ notification }: NotificationProps) {
  const host = headers().get('host');

  return (
    <div>
      <p>{notification.subject}</p>
      <LinkMarkDownTransformer text={notification.content} baseUrl={host} />
    </div>
  )
}