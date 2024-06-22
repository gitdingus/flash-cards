'use client';

export default function ChangeEmailForm() {
  return (
  <form>
    <fieldset>
      <legend>Change Email</legend>
      <label>
        New Email
        <input type="email" name="new-email" />
      </label>
      <button type="submit">Change Email</button>
    </fieldset>
  </form>
  )
}