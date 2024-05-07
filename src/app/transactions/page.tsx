'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();

  const type = searchParams.get('type');

  return <h1>Transactions - {type}</h1>;
}
