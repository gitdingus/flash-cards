'use client';
import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { createReport } from '@/actions/report';
interface CreateReportProps {
  setId: string,
}
export default function CreateReport({ setId } : CreateReportProps) {
  const [reported, setReported] = useState(false);
  const [formState, formAction] = useFormState(createReport, {});

  useEffect(() => {
    if (formState.form === 'reported') {
      setReported(true);
    }
  }, [formState]);

  if (reported) {
    return <p>Reported</p>
  }

  return (
    <div>
      <button type="button">Report</button>
      <div>
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