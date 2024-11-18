import { Metadata } from 'next';
import { getAllPublicSets, getAllowedPrivateSets, getOwnSets } from '@/app/lib/data';
import styles from '@/app/styles/cards/cards-gallery.module.css';

export const metadata: Metadata = {
  title: 'Browse Cards'
}

export default async function ListCards() {
  const [publicSets, privateSets, ownSets ] = await Promise.all([
    getAllPublicSets(),
    getAllowedPrivateSets(),
    getOwnSets(),
  ]);

  return (
    <div className={styles.container}>
      <SetGallery title="Public Sets" sets={publicSets} more={{ link: '/cards/public', title: "More public sets" }} />
      <SetGallery title="Private Sets" sets={privateSets} more={{ link: '/cards/private', title: "More private sets" }} />
      <SetGallery title="My Sets" sets={ownSets} more={{ link: '/cards/mine', title: 'More of my sets' }} />
    </div>
  )
}

function SetGallery({title, sets, more}: { title: string, sets: SetInfo[], more: { link: string, title: string }}) {
  return (
    <div className={styles.setGallery}>
      <h2>{title}</h2>
      <div className={styles.setList}>
        {
          sets.map(set => <SetThumb key={set.id} set={set} />)
        }
      </div>
      <a href={more.link}>{more.title}</a>
    </div>
  )
}

function SetThumb({ set }: { set: SetInfo }) {
  return (
    <div className={`${styles.setThumb}`}>
      <h2 className={styles.title}><a href={`/set/${set.id}`}>{set.title}</a></h2>
      <p className={styles.description}>{set.description}</p>
      <p className={styles.link}><a href={`/user/${set.ownerUsername}`}>{set.ownerUsername}</a></p>
      <p className={styles.cardCount}>{set.cardCount} card(s)</p>
    </div>
  )
}