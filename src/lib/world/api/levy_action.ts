import baseAxios from "../../../apiConfig";
import type {
  AdvanceResponseType,
  FindLevyActionResponseType,
  LevyActionRequestType,
} from "../../../model/levy_action";

export const levyActionApi = {
  async advance(arg: LevyActionRequestType, levyId: number) {
    return await baseAxios.post<AdvanceResponseType>(
      `/levy_actions/advance?levy_id=${levyId}`,
      {
        ...arg,
      },
      {
        withCredentials: true,
      },
    );
  },

  async findByLevyId(levyId: number) {
    return await baseAxios.get<FindLevyActionResponseType>(
      `/levy_actions?levy_id=${levyId}`,
      {
        withCredentials: true,
      },
    );
  },
};
