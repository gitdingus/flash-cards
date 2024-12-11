'use client';
import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { createReport } from '@/actions/report';
import styles from '@/app/styles/reports/create-report.module.css';

interface CreateReportProps {
  setId: string,
}
export default function CreateReport({ setId } : CreateReportProps) {
  const [reported, setReported] = useState(false);
  const [formState, formAction] = useFormState(createReport, {});
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (formState.form === 'reported') {
      setReported(true);
    }
  }, [formState]);

  if (reported) {
    return <p>Reported</p>
  }

  return (
    <div className={styles.createReport}>
      <form action={formAction}>
        <input type="hidden" name="setId" value={setId} />
        <textarea id={`${setId}-report`} name="report"></textarea>
        <p className={styles.message}>{formState.form || formState.report || ""}</p>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}