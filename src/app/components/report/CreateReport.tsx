'use client';
import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { createReport } from '@/actions/report';
import styles from '@/app/styles/report/create-report.module.css';

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
    <div className={styles.report}>
      <button 
        type="button"
        onClick={() => setCollapsed(!collapsed)}
      >
        { collapsed ? 'Report' : 'Hide Report' }
      </button>
      <div className={`${styles.reportDialog} ${collapsed ? '' : styles.expanded}`}>
        <form action={formAction}>
          <input type="hidden" name="setId" value={setId} />
          {
            formState.form &&
            <p>{formState.form}</p>
          }
          <label>
            Reason:
            <textarea name="report" rows={10} cols={75}></textarea>
          </label>
          {
            formState.report &&
            <p>{formState.report}</p>
          }
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  )
}