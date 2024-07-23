import { getSetInfo } from '@/app/lib/data';
import { useEffect, useState } from 'react';
import { PopulatedSetRecord } from '@/types/set';

interface SetInfoProps {
  id: string,
}

export default function SetInfo({ id }: SetInfoProps) {
  const [setInfo, setSetInfo] = useState<PopulatedSetRecord>();

  useEffect(() => {
    getSetInfo(id)
    .then((record) => {
      if (record === null) {
        return;
      }
      setSetInfo(record);
    });
  }, [id]);

  return (
    <div>
      <p>Set: <a href={`/set/${setInfo?.id}`}>{setInfo?.name}</a></p>
      <p>User: <a href={`/user/${setInfo?.ownerUsername}`}>{setInfo?.ownerUsername}</a></p>
    </div>
  )
}
