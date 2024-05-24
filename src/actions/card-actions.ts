'use server';
import { sql } from '@vercel/postgres';

export async function getCardData(id: string) {
  const cardData = await sql`
    SELECT * FROM cardline WHERE cardid=${id};
  `;
  
  const lines = cardData.rows.map((line) => {
    const newLine: LineRecord = { 
      cardId: line.cardid,
      heading: line.heading,
      content: line.content,
    };

    return newLine;
  })

  return lines;
}