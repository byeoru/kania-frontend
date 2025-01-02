import baseAxios from "../../../apiConfig";
import type {
  EstablishRealmRequestType,
  EstablishRealmResponseType,
  ExcuteCensusRequestType,
  GetMeAndOthersReamsType,
} from "../../../model/realm";
import type { ApiResponseType } from "../../../model/response";

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
  async excuteCensus(arg: ExcuteCensusRequestType) {
    return await baseAxios.post<ApiResponseType>(
      "/realms/census",
      {
        ...arg,
      },
      {
        withCredentials: true,
      },
    );
  },
};
