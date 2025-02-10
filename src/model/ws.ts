export type UpdateSectorBodyType = {
  sector: number;
  old_realm_id: number;
  new_realm_id: number;
  action_type: string;
  action_id: number;
};

export interface MessageType<T> {
  title: string;
  body: T;
}
