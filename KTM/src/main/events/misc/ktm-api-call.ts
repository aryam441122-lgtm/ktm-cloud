import { registerEvent } from "../register-event";
import { KTMApi } from "@main/services";

interface KTMApiCallPayload {
  method: "get" | "post" | "postResponse" | "put" | "patch" | "delete";
  url: string;
  data?: unknown;
  params?: unknown;
  options?: {
    needsAuth?: boolean;
    needsSubscription?: boolean;
    ifModifiedSince?: Date;
    acceptedStatuses?: number[];
  };
}

const ktmApiCall = async (
  _event: Electron.IpcMainInvokeEvent,
  payload: KTMApiCallPayload
) => {
  const { method, url, data, params, options } = payload;
  const ktmApiOptions = {
    ...options,
    validateStatus: options?.acceptedStatuses
      ? (status: number) =>
          status !== 401 &&
          (options.acceptedStatuses?.includes(status) ?? false)
      : undefined,
  };

  const getErrorMessage = (error: unknown): string | null => {
    if (typeof error === "object" && error !== null) {
      const response = (
        error as { response?: { data?: { message?: unknown } } }
      ).response;
      const responseMessage = response?.data?.message;

      if (typeof responseMessage === "string") {
        return responseMessage;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return null;
  };

  try {
    let request: Promise<unknown>;

    switch (method) {
      case "get":
        request = KTMApi.get(url, params, ktmApiOptions);
        break;
      case "post":
        request = KTMApi.post(url, data, ktmApiOptions);
        break;
      case "postResponse":
        request = KTMApi.postResponse(url, data, ktmApiOptions);
        break;
      case "put":
        request = KTMApi.put(url, data, ktmApiOptions);
        break;
      case "patch":
        request = KTMApi.patch(url, data, ktmApiOptions);
        break;
      case "delete":
        request = KTMApi.delete(url, ktmApiOptions);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return await request;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage ?? "ktm-api-call-failed");
  }
};

registerEvent("ktmApiCall", ktmApiCall);
