import baseAxios from "../../../apiConfig";
import type {
  GetPopulationRequestType,
  GetPopulationResponseType,
} from "../../../model/sector";

export const sectorApi = {
  async getPopulation(arg: GetPopulationRequestType) {
    return await baseAxios.get<GetPopulationResponseType>(
      `/sectors/${arg.cell_number}/population`,
      {
        withCredentials: true,
      },
    );
  },
};
