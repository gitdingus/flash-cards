'use client';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { createSet } from '@/actions/set-actions';

import SetInput from '@/app/components/set-tools/SetInput';

export default function CreateSet() {
  return (
    <SetInput submitAction={ async ({newSet, cardsInSet}, formData) => {
      createSet({ newSet, cardsInSet }, formData);
    }} />
  )
}