import { takeModAction } from '@/actions/mod-actions';

interface ModActionsFormProps {
  id: string, 
}

export default function ModActionsForm({ id }: ModActionsFormProps) {
  return (
    <div>
      <form action={takeModAction}>
        <input type="hidden" name="set-id" value={id} />
        <label>
          Mod actions:
          <select name="mod-action">
            <option value="hide-content">Hide content</option>
            <option value="unhide-content">Unhide content</option>
            <option value="close-no-action">Close - No action</option>
          </select>
        </label>
        <label>
          Explanation:
          <textarea name="explanation"></textarea>
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}