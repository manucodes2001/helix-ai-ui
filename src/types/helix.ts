/**
 * Strongly-typed domain models, enums, and API interfaces for Helix AI.
 * Aligned with domain/models.py, domain/enums.py, and api/server.py.
 */

export enum RelationshipStatus {
  VERIFIED = "Verified relationship",
  CANDIDATE = "Candidate relationship",
  UNVERIFIED = "Unverified relationship",
  NONE = "No relationship identified",
}

export enum ClaimVerificationStatus {
  VERIFIED = "Verified",
  PARTIALLY_SUPPORTED = "Partially supported",
  UNVERIFIED = "Unverified",
  UNSUPPORTED = "Unsupported",
  SOURCE_UNAVAILABLE = "Source unavailable",
}

export enum ExtractionFieldName {
  RESEARCH_OBJECTIVE = "research_objective",
  DISEASE_OR_CONDITION = "disease_or_condition",
  ORGANISM = "organism",
  SAMPLE_INFORMATION = "sample_information",
  EXPERIMENTAL_METHODOLOGY = "experimental_methodology",
  GENES_OR_BIOMARKERS = "genes_or_biomarkers",
  MAIN_FINDINGS = "main_findings",
  BIOLOGICAL_PATHWAYS = "biological_pathways",
  DATASET_ACCESSION_REFERENCES = "dataset_accession_references",
  RESEARCH_LIMITATIONS = "research_limitations",
}

export const EXTRACTION_FIELD_LABELS: Record<string, string> = {
  research_objective: "Research Objective",
  disease_or_condition: "Disease or Condition",
  organism: "Organism",
  sample_information: "Sample Information",
  experimental_methodology: "Experimental Methodology",
  genes_or_biomarkers: "Genes / Biomarkers",
  main_findings: "Main Findings",
  biological_pathways: "Biological Pathways",
  dataset_accession_references: "Dataset Accession References",
  research_limitations: "Research Limitations",
};

export interface Publication {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  publication_year: number | null;
  abstract: string;
  doi: string | null;
  pubmed_url: string;
  source_query: string;
  created_at: string;
  updated_at: string;
}

export interface GEOStudy {
  gse_accession: string;
  study_title: string;
  gds_uid: string | null;
  organism: string;
  platform: string;
  sample_count: number | null;
  study_summary: string;
  associated_pmids: string;
  geo_url: string;
  created_at: string;
  updated_at: string;
}

export interface PubGeoRelationship {
  id?: number;
  pmid: string;
  gse_accession: string;
  relationship_method: string;
  supporting_evidence: string;
  verification_status: RelationshipStatus | string;
  confidence_score: number;
  uncertainty_indicator: string;
  publication_title?: string;
  study_title?: string;
  organism?: string;
  platform?: string;
  sample_count?: number | null;
  geo_url?: string;
}

export interface ExtractedField {
  id?: number;
  pmid: string;
  field_name: string;
  extracted_value: string;
  supporting_passage: string;
  extraction_method: string;
  verification_status: ClaimVerificationStatus | string;
  verification_notes: string;
  grounding_score: number;
  publication_title?: string;
  journal?: string;
  publication_year?: number | null;
  pubmed_url?: string;
}

export interface PipelineRunRequest {
  query: string;
  max_results: number;
  link_geo: boolean;
  run_extraction: boolean;
  remote_id_verify: boolean;
}

export interface PipelineRunSummary {
  query: string;
  total_pubmed_hits: number;
  retrieved_publications: number;
  newly_inserted_publications: number;
  duplicates_skipped: number;
  geo_links_discovered: number;
  verified_geo_links: number;
  extracted_publications: number;
  errors: string[];
}

export interface GeoLookupRequest {
  gse_accession: string;
}

export interface DashboardStats {
  publications_count: number;
  geo_studies_count: number;
  verified_geo_links: number;
  candidate_geo_links: number;
  total_extracted_fields: number;
  verified_extracted_fields: number;
  unsupported_extracted_fields: number;
  searches_count: number;
}

export interface SearchRecord {
  id: number;
  query_text: string;
  db_source: string;
  retmax: number;
  total_found: number;
  retrieved_count: number;
  duplicates_skipped: number;
  excluded_count: number;
  created_at: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_searches: SearchRecord[];
}

export interface HealthResponse {
  status: string;
  has_openai_key: boolean;
  has_ncbi_key: boolean;
  openai_model: string;
  db_path: string;
}

export interface VerificationLog {
  id: number;
  entity_type: string;
  entity_id: string;
  pmid: string | null;
  field_name: string | null;
  status: string;
  details: string;
  created_at?: string;
}

export interface DatasetExportInfo {
  key: string;
  label: string;
  code: string;
  filename: string;
  description: string;
  fields: string[];
}
