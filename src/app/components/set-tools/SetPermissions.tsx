'use client';
import { useEffect, useState } from 'react';
import { setVisibility } from '@/actions/set-actions';
import { getAllowedUsersOfSet } from '@/app/lib/data';

interface SetPermissionsParams {
  set: SetInfoBase,
}

type SetVisibility = "public" | "private"
type PermissionsOptions = "allow" | "revoke" | undefined;

export default function SetPermissions({ set }: SetPermissionsParams) {
  const [ isPublic, setIsPublic ] = useState<SetVisibility>(set.isPublic ? "public" : "private");
  const [ permissionOption, setPermissionOption ] = useState<PermissionsOptions>("allow");
  const [ allowedUsers, setAllowedUsers ] = useState<PublicUser[]>([]);

  useEffect(() => {
    if (permissionOption === "revoke") {
      getAllowedUsersOfSet(set.id)
        .then((users) => {
          console.log(users);
          setAllowedUsers(users);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [permissionOption, set.id]);

  return (
    <div>
      <form action={setVisibility}>
        <input type="hidden" name="setId" value={set.id} />
        <select
          name="visibility"
          onChange={
            (e) => {
              switch (e.target.value) {
                case "public":
                  setIsPublic("public");
                  break;
                case "private":
                  setIsPublic("private");
                  break;
              }
          }}
          defaultValue={isPublic}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        {
          isPublic === "private" &&
          <select
            name="permissions"
            onChange={
              (e) => {
                switch (e.target.value) {
                  case "allow":
                    setPermissionOption("allow");
                    break;
                  case "revoke":
                    setPermissionOption("revoke");
                    break;
                }
              }
            }
            defaultValue={permissionOption}
          >
            <option value="allow">Allow</option>
            <option value="revoke">Revoke</option>
          </select>
        }
        {
          isPublic === "private" && permissionOption === "allow" && 
          <input type="text" name="user" />
        }
        {
          isPublic === "private" && permissionOption === "revoke" && 
          <select name="user" defaultValue="null">
            <option disabled value="null">Select user</option>
            {
              allowedUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))
            }
          </select>
        }
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}