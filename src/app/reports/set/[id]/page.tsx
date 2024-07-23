'use client';
import { useEffect, useState } from 'react';
import SetInfo from './SetInfo';
import ModActionsForm from './ModActionsForm';
import PastReports from './PastReports';
import PastActions from './PastActions';

interface ReportSummaryProps {
  params: {
    id: string,
  },
  searchParams: {
    resolved?: string,
    lastModified?: string,
  },
};

export default function ReportSummary({ params: { id }, searchParams}: ReportSummaryProps) {
  const { resolved, lastModified } = searchParams;
  let dateLastModified: Date | undefined = lastModified ? new Date(decodeURIComponent(lastModified)) : undefined;

  return (
    <div>
      <SetInfo id={id} />
      <ModActionsForm id={id} />
      {
        resolved &&
        <PastActions id={id} />
      }
      <PastReports id={id} resolved={!!resolved} dateLastModified={dateLastModified} />
    </div>
  )
}