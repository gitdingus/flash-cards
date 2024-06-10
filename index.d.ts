interface CardFront {
  title: string,
}

interface CardBack {
  lines: Line[];
}

interface Line {
  heading: string,
  content: string,
}

interface CardBase {
  front: CardFront,
  back: CardBack,
  id: string,
  dateCreated: Date,
}

interface SetInfo  {
  id: string,
  title: string,
  description: string,
  dateCreated: Date,
  owner: string,
  isPublic: boolean,
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