import { KTMApi } from "../ktm-api";

interface UnlockResponse {
  link: string;
}

export class DatanodesApi {
  public static async getDownloadUrl(uri: string): Promise<string> {
    const response = await KTMApi.post<UnlockResponse>(
      "/hosters/datanodes/unlock",
      { url: uri }
    );

    if (!response?.link) {
      throw new Error("Failed to unlock Datanodes URL");
    }

    return response.link;
  }
}
