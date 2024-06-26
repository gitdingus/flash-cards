import { Session } from "next-auth"
import { getUnreadNotifications } from "@/app/lib/notifications"
import { headers } from "next/headers";
import LinkMarkDownTransformer from "@/app/components/markdown-components/LinkMarkDownTransformer";

export default async function NotificationWidget({ session }: { session: Session }) {
  const notifications = await getUnreadNotifications(session.user.userId);

  if (notifications.length === 0) {
    return <div>No new notifications</div>
  } else {
    return (
      <div>
        <p>You have {notifications.length} unread notification(s)</p>
        <ul>
          {
            notifications.map((notification) => {
              return (
                <li key={notification.id}>
                  <div>
                    <LinkMarkDownTransformer text={notification.content} />
                  </div>
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }

}