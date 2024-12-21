import baseAxios from "../../../apiConfig";
import type {
  EstablishRealmRequestType,
  EstablishRealmResponseType,
  GetMeAndOthersReamsType,
} from "../../../model/realm";

export const realmApi = {
  async getMeAndTheOthersRealms() {
    return await baseAxios.get<GetMeAndOthersReamsType>("/realms", {
      withCredentials: true,
    });
  },
  async establishRealm(arg: EstablishRealmRequestType) {
    return await baseAxios.post<EstablishRealmResponseType>(
      "/realms",
      {
        ...arg,
      },
      {
        withCredentials: true,
      },
    );
  },
};
