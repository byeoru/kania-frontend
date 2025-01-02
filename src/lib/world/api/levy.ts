import baseAxios from "../../../apiConfig";
import type { LevyRequestType, LevyResponseType } from "../../../model/levy";

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
};
