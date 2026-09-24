'use client';
import dynamic from 'next/dynamic';

const PouchViewer = dynamic(() => import('@/components/product/PouchViewer'), { ssr: false });

export function ViewerSlot({ slug }: { slug: string }) {
  return <PouchViewer slug={slug} />;
}
