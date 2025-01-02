import baseAxios from "../../../apiConfig";
import type { GetRealmMembersLeviesResponseType } from "../../../model/realm_member";

export const realmMemberApi = {
  async getRealmMembersLevies() {
    return await baseAxios.get<GetRealmMembersLeviesResponseType>(
      "/realm_members/levies",
      {
        withCredentials: true,
      },
    );
  },
};
