import LinkMarkDownTransformer from "@/app/components/markdown-components/LinkMarkDownTransformer"

interface NotificationProps {
  notification: NotificationBase,
} 
export default function Notification({ notification }: NotificationProps) {
  return (
    <div>
      <p>{notification.subject}</p>
      <LinkMarkDownTransformer text={notification.content} />
    </div>
  )
}