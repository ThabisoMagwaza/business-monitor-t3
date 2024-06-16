import BusinessHealthSummary from '~/components/BusinessHealthSummary';
import { db } from '~/server/db';

export default async function Home() {
  const posts = await db.query.posts.findMany();
  return (
    <main>
      <ul>
        {posts.map((post, index) => (
          <li key={index}>{post.name}</li>
        ))}
      </ul>
      <BusinessHealthSummary />
    </main>
  );
}
