import { Session } from "next-auth"
import { getNotifications } from "@/app/lib/notifications"
import LinkMarkDownTransformer from "@/app/components/markdown-components/LinkMarkDownTransformer";

export default async function NotificationWidget({ session }: { session: Session }) {
  const { notifications, hasMore } = await getNotifications(session.user.userId, { limit: 5, viewed: false });

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
        <p><a href='/user/notifications'>{`View ${hasMore ? 'more' : 'all'} notifications`}</a></p>
      </div>
    )
  }

}