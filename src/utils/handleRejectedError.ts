import { IError } from "@/types/errorModel";

// Утилита для обработки rejected-ошибок
export const handleRejectedError = (action: any): IError | null => {
  if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
    return action.payload as IError;
  }
  return { message: "Unknown error", status: undefined };
};