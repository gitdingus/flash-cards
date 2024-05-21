import { sql } from '@vercel/postgres';


export async function GET(req: Request) {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments.pop();

  const getLines = async() => {
    const query = await sql`
      SELECT * FROM cardline WHERE cardid = ${id};
    `;

    return query;
  }

  const lines = (await getLines()).rows;

  return new Response(JSON.stringify(lines), {
    status: 200,
  });
}