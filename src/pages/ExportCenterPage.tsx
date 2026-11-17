import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import StorageIcon from "@mui/icons-material/Storage";
import TableViewIcon from "@mui/icons-material/TableView";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PageHeader } from "../components/layout/PageHeader";
import { helixApi } from "../api/helixApi";
import { DatasetExportInfo } from "../types/helix";

const DATASETS: DatasetExportInfo[] = [
  {
    key: "publications",
    code: "Dataset A",
    label: "PubMed Peer-Reviewed Publications",
    filename: "dataset_a_publications.csv",
    description:
      "All ingested scientific papers from PubMed with PMID, title, authors, journal, publication year, verbatim abstract, DOI, and source search query.",
    fields: [
      "pmid",
      "title",
      "authors",
      "journal",
      "publication_year",
      "abstract",
      "doi",
      "pubmed_url",
      "source_query",
    ],
  },
  {
    key: "geo_studies",
    code: "Dataset B",
    label: "NCBI GEO Gene Expression Series",
    filename: "dataset_b_geo_studies.csv",
    description:
      "Discovered NCBI GEO Series studies with GSE accession, study title, organism, platform (GPL), sample count, study summary, and associated PMIDs.",
    fields: [
      "gse_accession",
      "study_title",
      "organism",
      "platform",
      "sample_count",
      "study_summary",
      "associated_pmids",
      "geo_url",
    ],
  },
  {
    key: "relationships",
    code: "Dataset C",
    label: "Publication <-> GEO Evidence Relationships",
    filename: "dataset_c_pub_geo_relationships.csv",
    description:
      "Evidence-graded mappings connecting literature with GEO datasets via accession regex, NCBI Entrez E-link utilities, confidence scores, and uncertainty indicators.",
    fields: [
      "pmid",
      "publication_title",
      "gse_accession",
      "study_title",
      "relationship_method",
      "supporting_evidence",
      "verification_status",
      "confidence_score",
      "uncertainty_indicator",
    ],
  },
  {
    key: "extractions",
    code: "Dataset D1",
    label: "Extracted Scientific Entities with Provenance",
    filename: "dataset_d_extracted_provenance.csv",
    description:
      "10-field structured scientific extractions per paper featuring exact verbatim supporting passage quotes, claim grounding scores, and hallucination audit notes.",
    fields: [
      "pmid",
      "publication_title",
      "field_name",
      "extracted_value",
      "supporting_passage",
      "extraction_method",
      "verification_status",
      "grounding_score",
      "verification_notes",
    ],
  },
  {
    key: "master",
    code: "Dataset D2",
    label: "Master Integrated Scientific Intelligence Dataset",
    filename: "dataset_d_master_research.csv",
    description:
      "Denormalized unified export joining publication metadata, discovered GEO series, multi-evidence relationship status, and grounded scientific extraction fields.",
    fields: [
      "pmid",
      "publication_title",
      "authors",
      "journal",
      "gse_accession",
      "geo_study_title",
      "geo_organism",
      "field_name",
      "extracted_value",
      "grounding_score",
    ],
  },
  {
    key: "excluded",
    code: "Audit Log",
    label: "Excluded & Rejected Records Audit Log",
    filename: "excluded_records_audit.csv",
    description:
      "Governance audit log tracking invalid PMIDs, malformed GSE accessions, missing abstracts, or failed syntax checks rejected by the ingestion engine.",
    fields: [
      "id",
      "record_type",
      "raw_identifier",
      "exclusion_reason",
      "source_context",
      "recorded_at",
    ],
  },
];

export const ExportCenterPage: React.FC = () => {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadStats = async () => {
    try {
      const data = await helixApi.getDashboard();
      setCounts({
        publications: data.stats.publications_count,
        geo_studies: data.stats.geo_studies_count,
        relationships: data.stats.verified_geo_links + data.stats.candidate_geo_links,
        extractions: data.stats.total_extracted_fields,
        master: data.stats.publications_count,
        excluded: 0,
      });
    } catch (err: unknown) {
      console.warn("Could not fetch counts:", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleDownload = async (item: DatasetExportInfo) => {
    setDownloadingKey(item.key);
    try {
      await helixApi.downloadExportCsv(item.key, item.filename);
      setToast({
        open: true,
        message: `Successfully downloaded ${item.filename}`,
        severity: "success",
      });
    } catch (err: unknown) {
      setToast({
        open: true,
        message: err instanceof Error ? err.message : `Failed to download ${item.filename}`,
        severity: "error",
      });
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Research Dataset Export Center"
        subtitle="Export clean, provenance-preserved CSV datasets for downstream bioinformatics pipelines, statistical analysis, or manuscript publication."
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStats}
            size="small"
          >
            Refresh
          </Button>
        }
      />

      <Grid container spacing={3}>
        {DATASETS.map((ds) => {
          const isDownloading = downloadingKey === ds.key;
          const rowCount = counts[ds.key];

          return (
            <Grid key={ds.key} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  border: "1px solid #E2E8F0",
                  transition: "box-shadow 0.15s ease",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.07)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Chip
                      label={ds.code}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#0D9488",
                        color: "#FFFFFF",
                        fontSize: "0.7rem",
                      }}
                    />
                    {rowCount !== undefined && (
                      <Chip
                        icon={<TableViewIcon style={{ fontSize: 13 }} />}
                        label={`${rowCount} record(s)`}
                        size="small"
                        sx={{
                          backgroundColor: "#F1F5F9",
                          color: "#334155",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, fontSize: "1.05rem" }}>
                    {ds.label}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#475569", mb: 2, fontSize: "0.85rem", lineHeight: 1.5 }}>
                    {ds.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", display: "block", mb: 0.75, textTransform: "uppercase" }}>
                      EXPORT SCHEMA PREVIEW ({ds.fields.length} columns)
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {ds.fields.map((f) => (
                        <Chip
                          key={f}
                          label={f}
                          size="small"
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.68rem",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            color: "#334155",
                            height: 22,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2.5, pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: '"JetBrains Mono", monospace', color: "#64748B" }}
                    >
                      {ds.filename}
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      disabled={isDownloading}
                      startIcon={isDownloading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
                      onClick={() => handleDownload(ds)}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: "#0D9488",
                        "&:hover": { backgroundColor: "#0F766E" },
                        px: 2,
                      }}
                    >
                      {isDownloading ? "Preparing..." : "Download CSV"}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Toast Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportCenterPage;
