import baseAxios from "../../../apiConfig";
import type { ApiResponseType } from "../../../model/response";
import type { LoginRequestType, SignupRequestType } from "../../../model/user";

export const userApi = {
  async signup(arg: SignupRequestType) {
    return await baseAxios.post<ApiResponseType>("/signup", {
      ...arg,
    });
  },

  async login(arg: LoginRequestType) {
    return await baseAxios.post<ApiResponseType>("/login", {
      ...arg,
    });
  },
};
