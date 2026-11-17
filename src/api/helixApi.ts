import apiClient from "./client";
import type {
  DashboardResponse,
  ExtractedField,
  GEOStudy,
  GeoLookupRequest,
  HealthResponse,
  PipelineRunRequest,
  PipelineRunSummary,
  Publication,
  PubGeoRelationship,
  VerificationLog,
} from "../types/helix";

export const helixApi = {
  /**
   * Health and runtime readiness check.
   */
  getHealth: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>("/api/health");
    return res.data;
  },

  /**
   * Dashboard KPI statistics and recent searches.
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    const res = await apiClient.get<DashboardResponse>("/api/dashboard");
    return res.data;
  },

  /**
   * Run end-to-end research pipeline.
   */
  runPipeline: async (req: PipelineRunRequest): Promise<PipelineRunSummary> => {
    const res = await apiClient.post<PipelineRunSummary>("/api/pipeline/run", req);
    return res.data;
  },

  /**
   * Get all stored publications, optionally filtered by keyword.
   */
  getPublications: async (queryFilter?: string): Promise<Publication[]> => {
    const res = await apiClient.get<Publication[]>("/api/publications", {
      params: queryFilter?.trim() ? { q: queryFilter.trim() } : undefined,
    });
    return res.data;
  },

  /**
   * Trigger GEO cross-referencing for a single publication.
   */
  crossReferencePublication: async (pmid: string): Promise<PubGeoRelationship[]> => {
    const res = await apiClient.post<PubGeoRelationship[]>(
      `/api/publications/${encodeURIComponent(pmid)}/cross-reference`
    );
    return res.data;
  },

  /**
   * Trigger LLM structured extraction and grounding verification for a publication.
   */
  extractPublication: async (pmid: string): Promise<ExtractedField[]> => {
    const res = await apiClient.post<ExtractedField[]>(
      `/api/publications/${encodeURIComponent(pmid)}/extract`
    );
    return res.data;
  },

  /**
   * Get all stored NCBI GEO studies.
   */
  getGeoStudies: async (): Promise<GEOStudy[]> => {
    const res = await apiClient.get<GEOStudy[]>("/api/geo");
    return res.data;
  },

  /**
   * Perform direct GSE accession lookup via NCBI E-utilities.
   */
  lookupGeoStudy: async (req: GeoLookupRequest): Promise<GEOStudy> => {
    const res = await apiClient.post<GEOStudy>("/api/geo/lookup", req);
    return res.data;
  },

  /**
   * Get all publication <-> GEO relationships.
   */
  getRelationships: async (): Promise<PubGeoRelationship[]> => {
    const res = await apiClient.get<PubGeoRelationship[]>("/api/relationships");
    return res.data;
  },

  /**
   * Get extracted fields, optionally filtered by PMID.
   */
  getExtractions: async (pmid?: string): Promise<ExtractedField[]> => {
    const res = await apiClient.get<ExtractedField[]>("/api/extractions", {
      params: pmid ? { pmid } : undefined,
    });
    return res.data;
  },

  /**
   * Get verification audit logs.
   */
  getVerificationLogs: async (): Promise<VerificationLog[]> => {
    const res = await apiClient.get<VerificationLog[]>("/api/verification/logs");
    return res.data;
  },

  /**
   * Download dataset CSV as a blob and trigger browser download.
   */
  downloadExportCsv: async (datasetKey: string, filename: string): Promise<void> => {
    const res = await apiClient.get(`/api/export/${datasetKey}`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Construct direct export URL for streaming.
   */
  getExportUrl: (datasetKey: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? "" : "http://localhost:8000");
    return `${base}/api/export/${datasetKey}`;
  },
};
