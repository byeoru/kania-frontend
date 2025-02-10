import { HttpStatusCode } from "axios";
import type { UpdateSectorBodyType } from "../model/ws";
import {
  isMySector,
  ourRealmLevyActionsStored,
  ourSectorLeviesStored,
  storeCellLevies,
  storeLevyActions,
} from "./shared.svelte";
import { levyActionApi } from "./world/api/levy_action";
import { worldMetadata } from "./world/worldMetadata";
import { levyApi } from "./world/api/levy";

export const annexIndigenousSector = async (body: UpdateSectorBodyType) => {
  // levy update
  if (ourRealmLevyActionsStored.has(body.action_id)) {
    const action = ourRealmLevyActionsStored.get(body.action_id)!;
    await worldMetadata.updateLevyEncampment(action);
    worldMetadata.eraseActionLogoAndRoad(action.levy_action_id);
    ourRealmLevyActionsStored.delete(action.levy_action_id);
  }
  // sector update
  worldMetadata.updateSectorOwner(body);
};

export const returnToEncampment = async (body: UpdateSectorBodyType) => {
  // 내가 공격자일 경우
  if (ourRealmLevyActionsStored.has(body.action_id)) {
    const storedAction = ourRealmLevyActionsStored.get(body.action_id)!;
    worldMetadata.eraseActionLogoAndRoad(body.action_id);
    const res = await levyActionApi.findByLevyId(storedAction.levy_id);
    switch (res.status) {
      case HttpStatusCode.Ok:
        const returnAction = res.data.levy_action;
        storeLevyActions([returnAction]);
        worldMetadata.drawReturnLogo(
          returnAction.origin_sector,
          returnAction.levy_action_id,
        );
        worldMetadata.drawActionRoad(
          returnAction.levy_action_id,
          "Return",
          returnAction.origin_sector,
          returnAction.target_sector,
        );
        ourRealmLevyActionsStored.delete(body.action_id);
        break;
      default:
        alert(res.data.api_response.description);
        break;
    }
    // 내가 방어자일 경우
  } else if (isMySector(body.sector)) {
    const res = await levyApi.getSectorLevies(body.sector);
    switch (res.status) {
      case HttpStatusCode.Ok:
        const levies = res.data.realm_levies;
        ourSectorLeviesStored.delete(body.sector);
        storeCellLevies(levies);
        break;
      default:
        alert(res.data.api_response.description);
        break;
    }
  }
};

export const returnCompleted = async (body: UpdateSectorBodyType) => {
  if (!ourRealmLevyActionsStored.has(body.action_id)) {
    return;
  }
  const returnToEncampmentAction = ourRealmLevyActionsStored.get(
    body.action_id,
  )!;
  await worldMetadata.updateReturnedLevyEncampment(returnToEncampmentAction);
  worldMetadata.eraseActionLogoAndRoad(returnToEncampmentAction.levy_action_id);
  ourRealmLevyActionsStored.delete(body.action_id);
};

export const annihilateAttacker = (body: UpdateSectorBodyType) => {
  if (!ourRealmLevyActionsStored.has(body.action_id)) {
    return;
  }
  const attackAction = ourRealmLevyActionsStored.get(body.action_id)!;
  worldMetadata.updateAnnihilatedLevy(attackAction);
  worldMetadata.eraseActionLogoAndRoad(attackAction.levy_action_id);
  ourRealmLevyActionsStored.delete(attackAction.levy_action_id);
};

export const reinforceTroops = async (body: UpdateSectorBodyType) => {
  if (!ourRealmLevyActionsStored.has(body.action_id)) {
    return;
  }
  // levy update
  if (!ourRealmLevyActionsStored.has(body.action_id)) {
    return;
  }
  const action = ourRealmLevyActionsStored.get(body.action_id)!;
  await worldMetadata.updateLevyEncampment(action);
  worldMetadata.eraseActionLogoAndRoad(action.levy_action_id);
  ourRealmLevyActionsStored.delete(action.levy_action_id);
};

export const annexAndDisbandUnit = async (body: UpdateSectorBodyType) => {
  // 내가 공격자일 경우
  if (ourRealmLevyActionsStored.has(body.action_id)) {
    const action = ourRealmLevyActionsStored.get(body.action_id)!;
    await worldMetadata.updateLevyEncampment(action);
    worldMetadata.eraseActionLogoAndRoad(action.levy_action_id);
    ourRealmLevyActionsStored.delete(action.levy_action_id);
  } else if (isMySector(body.sector)) {
    // 내가 방어자일 경우
    ourSectorLeviesStored.delete(body.sector);
  }
  // sector update
  worldMetadata.updateSectorOwner(body);
};

export const annexSector = async (body: UpdateSectorBodyType) => {
  // 내가 공격자일 경우
  if (ourRealmLevyActionsStored.has(body.action_id)) {
  } else if (isMySector(body.sector)) {
    // 내가 방어자일 경우
  }
  // sector update
  worldMetadata.updateSectorOwner(body);
};

// SurrenderToTarget;
// AnnexSector;
