import baseAxios from "../../../apiConfig";
import type {
  GetMeAndOthersReamsResponseType,
  GetOurRealmLeviesWithActionsResponseType,
} from "../../../model/realm_member";

export const realmMemberApi = {
  async getMeAndTheOthersRealms() {
    return await baseAxios.get<GetMeAndOthersReamsResponseType>(
      "/realm_members/realms",
      {
        withCredentials: true,
      },
    );
  },
  async getOurRealmLevies() {
    return await baseAxios.get<GetOurRealmLeviesWithActionsResponseType>(
      "/realm_members/levies",
      {
        withCredentials: true,
      },
    );
  },
};
