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
}

interface SetInfoBase {
  id: string,
  title: string,
  description: string,
  dateCreated: Date,
  isPublic: boolean,  
}

interface SetInfo extends SetInfoBase {
  owner: string,
}

interface SetOfCards extends SetInfo{
  cards: CardBase[],
}

interface CardRecord {
  id: string,
  inSet: string,
  dateCreated: Date,
  title: string,
}

interface LineRecord {
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

type NotificationType = "mod-action" | "new-follower" | "new-set" | "set-permission";

interface Notification {
  id: string,
  type: NotificationType,
  subject: string,
  content: string,
  recipient: string,
  viewed: boolean,
  dateCreated: Date,
}