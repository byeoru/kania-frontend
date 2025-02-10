import baseAxios from "../../../apiConfig";
import type {
  FindLevyResponseType,
  FindSectorLeviesResponseType,
  LevyRequestType,
  LevyResponseType,
} from "../../../model/levy";

export const levyApi = {
  async muster(arg: LevyRequestType) {
    return await baseAxios.post<LevyResponseType>(
      "/levies",
      {
        ...arg,
      },
      {
        withCredentials: true,
      },
    );
  },

  async findLevy(levyId: number) {
    return await baseAxios.get<FindLevyResponseType>(`/levies/${levyId}`, {
      withCredentials: true,
    });
  },

  async getSectorLevies(sector: number) {
    return await baseAxios.get<FindSectorLeviesResponseType>(
      `/levies?sector=${sector}`,
      {
        withCredentials: true,
      },
    );
  },
};
