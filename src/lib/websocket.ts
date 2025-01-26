import type { WSReqeustType, WSResponseType } from "../model/ws";

export default class WebSocketClient {
  private ws: WebSocket;
  private pendingRequests: Map<string, (response: WSResponseType) => void>;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.pendingRequests = new Map();

    // WebSocket 응답 처리
    this.ws.onmessage = (event) => {
      const res = JSON.parse(event.data);
      switch (res.title) {
      }

      // 요청 ID를 기반으로 Promise 해결
      const resolver = this.pendingRequests.get(res.title);
      if (resolver) {
        resolver(res);
        this.pendingRequests.delete(res.title); // 처리 완료 후 삭제
      }
    };

    this.ws.onopen = () => console.log("WebSocket connected");
    this.ws.onerror = (error) => console.error("WebSocket error:", error);
    this.ws.onclose = () => console.log("WebSocket closed");
  }

  // 메시지를 보내고 응답을 기다리는 메서드
  sendRequest(request: WSReqeustType): Promise<WSResponseType> {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket is not open"));
        return;
      }

      // 요청 저장
      this.pendingRequests.set(request.title, resolve);

      // 메시지 전송
      this.ws.send(JSON.stringify(request));
    });
  }

  close() {
    this.ws.close();
  }
}
