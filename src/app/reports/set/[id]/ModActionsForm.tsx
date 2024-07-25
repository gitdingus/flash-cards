'use client';
import { ChangeEvent, useState } from 'react';
import { takeModAction } from '@/actions/mod-actions';

interface ModActionsFormProps {
  id: string, 
}

export default function ModActionsForm({ id }: ModActionsFormProps) {
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  function modActionChanged(e: ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === 'suspend-user'){
      setShowDurationPicker(true);
    } else {
      setShowDurationPicker(false);
    }
  }

  return (
    <div>
      <form action={takeModAction}>
        <input type="hidden" name="set-id" value={id} />
        <label>
          Mod actions:
          <select name="mod-action" onChange={modActionChanged}>
            <option value="hide-content">Hide content</option>
            <option value="unhide-content">Unhide content</option>
            <option value="close-no-action">Close - No action</option>
            <option value="remove-content">Remove Content - PERMANENT ACTION</option>
            <option value="suspend-user">Suspend User</option>
          </select>
        </label>
        <label>
          Explanation:
          <textarea name="explanation"></textarea>
        </label>
        {
          showDurationPicker && 
          <select name="duration">
            <option value="three-days">Three days</option>
            <option value="one-week">One week</option>
            <option value="one-month">One month</option>
            <option value="permanent">Permanent Suspension</option>
          </select>
        }
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}