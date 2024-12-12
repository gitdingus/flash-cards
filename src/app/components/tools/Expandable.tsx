'use client';

import React, { useState } from 'react';
import styles from '@/app/styles/tools/expandable.module.css';

interface ExpandableProps {
  children: React.ReactNode,
  buttonText: string,
}

export default function Expandable({ children, buttonText }: ExpandableProps) {
  const [ expanded, setExpanded ] = useState(false);

  return (
    <div>
      <div>
        <button onClick={() => setExpanded(!expanded)}>{buttonText}</button>
      </div>
      <div className={`${styles.expandable} ${expanded ? styles.expanded : ''}`}>
        { children }
      </div>
    </div>
  )
}