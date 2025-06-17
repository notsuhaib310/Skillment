import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatchAllPage(props: PageProps) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const slugParts = Array.isArray(params.slug) ? params.slug : [];
  const slugPath = slugParts.join('/');

  // Example:
  // /about → /public/import/about/page.html
  // /      → /public/import/page.html
  const fullPath = path.join(
    process.cwd(),
    'public',
    'import',
    slugPath || '',
    'page.html'
  );

  try {
    const html = await fs.readFile(fullPath, 'utf-8');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return notFound();
  }
}
