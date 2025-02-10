import type { ApiResponseType } from "./response";

export type LevyActionRequestType = {
  origin_sector: number;
  target_sector: number;
};

export type LevyActionResponseType = {
  levy_action_id: number;
  levy_id: number;
  realm_id: number;
  origin_sector: number;
  target_sector: number;
  action_type: string;
  started_at: Date;
  expected_completion_at: Date;
};

export interface AdvanceResponseType extends ApiResponseType {
  levy_action: LevyActionResponseType;
}

export interface FindLevyActionResponseType extends ApiResponseType {
  levy_action: LevyActionResponseType;
}
