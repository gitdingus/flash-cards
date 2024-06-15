'use client';
import { useState } from 'react';

interface SetPermissionsParams {
  set: SetInfoBase,
  allowedUsers: PublicUser[],
}

type PermissionsOptions = "public" | "allow" | "revoke";

export default function SetPermissions({ set, allowedUsers }: SetPermissionsParams) {
  const [ permissionOption, setPermissionOption ] = useState<PermissionsOptions>(set.isPublic ? "public" : "allow");
  return (
    <div>
      <form>
        <select
          name="permission-action"
          onChange={
            (e) => {
              switch (e.target.value) {
                case "allow":
                  setPermissionOption("allow");
                  break;
                case "revoke":
                  setPermissionOption("revoke");
                  break;
                case "public":
                  setPermissionOption("public");
              }
          }}
          defaultValue={permissionOption}
        >
          <option value="allow">Allow</option>
          <option value="revoke">Revoke</option>
          <option value="public">Public</option>
        </select>
        {
          permissionOption === "allow" &&
          <input type="text" name="user" />
        }
        {
          permissionOption === "revoke" &&
          <select name="user" defaultValue="null">
            <option disabled value="null">Select user</option>
            {
              allowedUsers.map((user) => (
                <option key={user.id} value={user.username}>{user.username}</option>
              ))
            }
          </select>
        }
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}