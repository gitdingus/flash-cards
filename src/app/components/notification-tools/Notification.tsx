'use client';
import LinkMarkDownTransformer from "@/app/components/markdown-components/LinkMarkDownTransformer"
import { headers } from "next/headers";
interface NotificationProps {
  notification: NotificationBase,
} 
export default function Notification({ notification }: NotificationProps) {
  const host = window.location.host;

  return (
    <div className={!notification.viewed ? 'unread' : ''}>
      <p><span>{notification.subject}</span> <span>{notification.dateCreated.toLocaleString()}</span></p>
      <LinkMarkDownTransformer text={notification.content} baseUrl={host} />
    </div>
  )
}