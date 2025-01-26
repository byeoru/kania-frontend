import baseAxios from "../../../apiConfig";
import type { LevyActionRequestType } from "../../../model/levy_action";
import type { ApiResponseType } from "../../../model/response";

export const levyActionApi = {
  async advance(arg: LevyActionRequestType, levyId: number) {
    return await baseAxios.post<ApiResponseType>(
      `/levy_action/advance?levy_id=${levyId}`,
      {
        ...arg,
      },
      {
        withCredentials: true,
      },
    );
  },
};
