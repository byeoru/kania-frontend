import baseAxios from "../../../apiConfig";
import type {
  GetMeAndOthersReamsResponseType,
  GetOurRealmLeviesResponseType,
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
    return await baseAxios.get<GetOurRealmLeviesResponseType>(
      "/realm_members/levies",
      {
        withCredentials: true,
      },
    );
  },
};
