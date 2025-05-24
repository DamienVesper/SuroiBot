import axios, { AxiosInstance } from "axios";

export class SuroiAPI {
    client: AxiosInstance;

    constructor (baseURL: string, apiKey: string) {
        this.client = axios.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
    }

    /**
     * Fetch a report given an ID.
     * @param id The ID of the report.
     * @returns Report if present, null if not.
     */
    fetchReport = async (id: string): Promise<Report | null> => await this.client.get<any, Report | null, undefined>(`/moderation/reports/fetch?id=${id}`);
}

export interface Report {
    id: string
    createdAt: Date
    targetName: string
    issuerName: string
    reason: string
}
