import { useEffect, useState } from 'react';
import { getPastActions } from '@/app/lib/reports';
import { FriendlyReportAction } from '@/types/report';

interface PastActionsProps {
  id: string,
}
export default function PastActions({ id }: PastActionsProps) {
  const [pastActions, setPastActions] = useState<FriendlyReportAction[]>([]);

  useEffect(() => {
    getPastActions(id)
      .then((actions) => {
        setPastActions(actions);
      });
  }, [id]);

  return (
    <div>
      {
        pastActions.length > 0 &&
        <div>
          <h1>Past actions</h1>
          <table>
            <thead>
              <tr>
                <td>Date Resolved</td>
                <td>Moderator</td>
                <td>Action Taken</td>
                <td>Set Last Modified</td>
              </tr>
            </thead>
            <tbody>
              {
                pastActions.map((action) => {
                  return (
                    <tr key={action.id}>
                      <td>{action.dateResolved.toLocaleString()}</td>
                      <td><a href={`/user/${action.moderatorUsername}`}>{action.moderatorUsername}</a></td>
                      <td>
                        <p>{action.actionTaken}</p>
                        <p>{action.explanation}</p>
                      </td>
                      <td>{action.setLastModified.toLocaleString()}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  )
}