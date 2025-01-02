import type { ApiResponseType } from "./response";

export type GetPopulationRequestType = {
  cell_number: number;
};

export interface GetPopulationResponseType extends ApiResponseType {
  population: number;
}
