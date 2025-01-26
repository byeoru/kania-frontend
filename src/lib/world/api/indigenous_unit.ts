import baseAxios from "../../../apiConfig";
import type { GetIndigenousUnitResponseType } from "../../../model/indigenous_unit";

export const indigenousUnitApi = {
  async getIndigenousUnit(sectorNumber: number) {
    return await baseAxios.get<GetIndigenousUnitResponseType>(
      `/indigenous_units/${sectorNumber}`,
      {
        withCredentials: true,
      },
    );
  },
};
