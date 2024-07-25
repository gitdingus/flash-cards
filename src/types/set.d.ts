export interface SetRecord {
  id: string,
  name: string,
  description: string,
  ownerId: string,
  public: boolean,
  hidden: boolean
  dateCreated: Date,
  lastModified: Date,
  removed: boolean,
}

export interface PopulatedSetRecord extends SetRecord {
  ownerUsername: string,
}