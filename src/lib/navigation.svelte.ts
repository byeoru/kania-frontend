import type { Component } from "svelte";
import Home from "../routes/Home.svelte";
import World from "../routes/World.svelte";

// 현재 경로 상태
let _currentRoute = $state<string>(window.location.pathname);

// // 경로와 컴포넌트 매핑
export const routes: Record<string, Component> = {
  "/": Home,
  "/world": World,
};

export const currentRoute = {
  get value() {
    return _currentRoute;
  },
  set value(newVal) {
    _currentRoute = newVal;
  },
};

// URL 변경 감지 함수
const handleRouteChange = (): void => {
  _currentRoute = window.location.pathname;
};

// popstate 이벤트로 뒤로가기/앞으로가기 감지
window.addEventListener("popstate", handleRouteChange);

// 네비게이션 함수
export const navigate = (path: string): void => {
  if (path !== _currentRoute) {
    history.pushState(null, "", path);
    handleRouteChange();
  }
};
