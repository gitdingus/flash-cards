interface CardFront {
  title: string,
}

interface CardBack {
  lines: Line[];
}

interface Line {
  heading: string,
  content: string,
  id: string, 
}

interface CardBase {
  front: CardFront,
  back: CardBack,
  id: string,
  dateCreated: Date,
  lastModified: Date,
}

interface SetInfoBase {
  id: string,
  title: string,
  description: string,
  dateCreated: Date,
  isPublic: boolean, 
  lastModified: Date,
}

interface SetInfo extends SetInfoBase {
  owner: string,
  ownerUsername: string,
  cardCount: number,
}

interface SetOfCards extends SetInfo{
  cards: CardBase[],
}

interface CardRecord {
  id: string,
  inSet: string,
  dateCreated: Date,
  title: string,
  lastModified: Date,
}

interface LineRecord {
  id: string,
  cardId: string,
  heading: string,
  content: string, 
}

interface CardInSet extends CardBase {
  inSet: string,
}

interface UserRecord {
  id: string,
  username: string,
  salt: string,
  passwordhash: string,
  email: string,
  datecreated: string,
}

interface PublicUser {
  id: string,
  username: string,
  email: string,
  dateCreated: string,
}

interface ChangePasswordFormState {
  form?: string,
  currentPassword?: string,
  newPassword?: string,
  confirmPassword?: string,
}

interface ChangeEmailFormState {
  form?: string,
  newEmail?: string,
  data?: {
    email?: string,
  }
}

type NotificationType = 
  "mod-action" 
  | "new-follower" 
  | "new-set" 
  | "set-permission-granted" 
  | "set-permission-revoked";

interface NotificationBase {
  id: string,
  type: NotificationType,
  subject: string,
  content: string, 
  viewed: boolean,
  dateCreated: Date, 
}

interface AppNotification extends NotificationBase {
  recipient: PublicUser,
}