export type TickMessageType = {
  title: string;
  body: string;
};

export type WSReqeustType = {
  title: string;
};

export interface WSResponseType extends TickMessageType {
  id: number;
}
