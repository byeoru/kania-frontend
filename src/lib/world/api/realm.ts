import baseAxios from "../../../apiConfig";
import type {
  EstablishRealmRequestType,
  EstablishRealmResponseType,
  ExcuteCensusRequestType,
} from "../../../model/realm";
import type { ApiResponseType } from "../../../model/response";

export const realmApi = {
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
