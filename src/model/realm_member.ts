import type { LevyType } from "./levy";
import type { ApiResponseType } from "./response";

export interface GetRealmMembersLeviesResponseType extends ApiResponseType {
  realm_members: RealmMembersResponseType[];
}

export type RealmMembersResponseType = {
  realm_member: RealmMemberIDsType;
  levies: LevyType[];
};

export type RealmMemberIDsType = {
  user_id: number;
  realm_id: number;
};
