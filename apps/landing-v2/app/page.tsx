// app/page.tsx
import fs from 'fs/promises';
import path from 'path';

export default async function HomePage() {
  const filePath = path.join(process.cwd(), 'public', 'import', 'page.html');
  const html = await fs.readFile(filePath, 'utf-8');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
