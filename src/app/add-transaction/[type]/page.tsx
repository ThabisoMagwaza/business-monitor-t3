'use client';
import * as React from 'react';

type AddTransactionParams = {
  type: 'expense' | 'income';
};

export default function Page({
  params: { type },
}: {
  params: AddTransactionParams;
}) {
  return <h1>Add transaction - {type} </h1>;
}
