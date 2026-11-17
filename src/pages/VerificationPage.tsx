import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import BlockIcon from "@mui/icons-material/Block";
import { PageHeader } from "../components/layout/PageHeader";
import { StatusChip } from "../components/common/StatusChip";
import { helixApi } from "../api/helixApi";
import {
  ClaimVerificationStatus,
  EXTRACTION_FIELD_LABELS,
  ExtractedField,
  VerificationLog,
} from "../types/helix";

export const VerificationPage: React.FC = () => {
  const [extractions, setExtractions] = useState<ExtractedField[]>([]);
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [extData, logData] = await Promise.all([
        helixApi.getExtractions(),
        helixApi.getVerificationLogs(),
      ]);
      setExtractions(extData);
      setLogs(logData);
    } catch (err: unknown) {
      console.error(err);
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Failed to load verification data.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Status counts
  const verifiedCount = extractions.filter((f) => f.verification_status === ClaimVerificationStatus.VERIFIED).length;
  const partiallyCount = extractions.filter((f) => f.verification_status === ClaimVerificationStatus.PARTIALLY_SUPPORTED).length;
  const unsupportedCount = extractions.filter((f) => f.verification_status === ClaimVerificationStatus.UNSUPPORTED).length;
  const unverifiedCount = extractions.filter((f) => f.verification_status === ClaimVerificationStatus.UNVERIFIED).length;
  const unavailableCount = extractions.filter((f) => f.verification_status === ClaimVerificationStatus.SOURCE_UNAVAILABLE).length;

  const filteredExtractions = extractions.filter((item) => {
    if (statusFilter === "ALL") return true;
    return item.verification_status === statusFilter;
  });

  const logColumns: GridColDef<VerificationLog>[] = [
    {
      field: "id",
      headerName: "Audit ID",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
          #{params.value}
        </Typography>
      ),
    },
    {
      field: "entity_type",
      headerName: "Entity Type",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value?.toUpperCase()}
          size="small"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.68rem",
            fontWeight: 700,
            backgroundColor: "#F1F5F9",
          }}
        />
      ),
    },
    {
      field: "entity_id",
      headerName: "Entity ID",
      width: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: "#0F172A" }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Audit Status",
      width: 160,
      renderCell: (params) => <StatusChip status={params.value} size="small" />,
    },
    {
      field: "details",
      headerName: "Verification Details & Provenance",
      flex: 1.8,
      minWidth: 320,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.825rem" }} title={params.value}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "created_at",
      headerName: "Timestamp",
      width: 170,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
          {params.value || "—"}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Evidence Validation & Claim-Level Grounding Audit"
        subtitle="Separates citation existence from claim-level grounding. Analyzes semantic alignment, verbatim token overlap, and numeric consistency to detect LLM hallucinations."
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            size="small"
          >
            Refresh
          </Button>
        }
      />

      {/* 5-Status Summary KPI Counters */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#DCFCE7",
              border: "1px solid #86EFAC",
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
            onClick={() => setStatusFilter(ClaimVerificationStatus.VERIFIED)}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
              <CheckCircleOutlinedIcon sx={{ color: "#166534" }} />
            </Box>
            <Typography variant="caption" sx={{ color: "#166534", fontWeight: 700, display: "block" }}>
              VERIFIED
            </Typography>
            <Typography variant="h5" sx={{ color: "#14532D", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
              {verifiedCount}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#FEF9C3",
              border: "1px solid #FDE047",
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
            onClick={() => setStatusFilter(ClaimVerificationStatus.PARTIALLY_SUPPORTED)}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
              <WarningAmberOutlinedIcon sx={{ color: "#854D0E" }} />
            </Box>
            <Typography variant="caption" sx={{ color: "#854D0E", fontWeight: 700, display: "block" }}>
              PARTIALLY SUPPORTED
            </Typography>
            <Typography variant="h5" sx={{ color: "#713F12", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
              {partiallyCount}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#FEE2E2",
              border: "1px solid #FCA5A5",
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
            onClick={() => setStatusFilter(ClaimVerificationStatus.UNSUPPORTED)}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
              <ErrorOutlinedIcon sx={{ color: "#991B1B" }} />
            </Box>
            <Typography variant="caption" sx={{ color: "#991B1B", fontWeight: 700, display: "block" }}>
              UNSUPPORTED (FLAGGED)
            </Typography>
            <Typography variant="h5" sx={{ color: "#7F1D1D", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
              {unsupportedCount}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#F1F5F9",
              border: "1px solid #CBD5E1",
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
            onClick={() => setStatusFilter(ClaimVerificationStatus.UNVERIFIED)}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
              <FactCheckIcon sx={{ color: "#475569" }} />
            </Box>
            <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, display: "block" }}>
              UNVERIFIED
            </Typography>
            <Typography variant="h5" sx={{ color: "#1E293B", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
              {unverifiedCount}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#F3F4F6",
              border: "1px solid #D1D5DB",
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
            onClick={() => setStatusFilter(ClaimVerificationStatus.SOURCE_UNAVAILABLE)}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
              <BlockIcon sx={{ color: "#6B7280" }} />
            </Box>
            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700, display: "block" }}>
              SOURCE UNAVAILABLE
            </Typography>
            <Typography variant="h5" sx={{ color: "#374151", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
              {unavailableCount}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Filter Chips Bar */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", mr: 0.5 }}>
          SHOWING:
        </Typography>
        <Chip
          label={`All Claims (${extractions.length})`}
          clickable
          onClick={() => setStatusFilter("ALL")}
          color={statusFilter === "ALL" ? "primary" : "default"}
          size="small"
        />
        <Chip
          label="Verified Only"
          clickable
          onClick={() => setStatusFilter(ClaimVerificationStatus.VERIFIED)}
          color={statusFilter === ClaimVerificationStatus.VERIFIED ? "primary" : "default"}
          size="small"
        />
        <Chip
          label="Partially Supported"
          clickable
          onClick={() => setStatusFilter(ClaimVerificationStatus.PARTIALLY_SUPPORTED)}
          color={statusFilter === ClaimVerificationStatus.PARTIALLY_SUPPORTED ? "primary" : "default"}
          size="small"
        />
        <Chip
          label="Unsupported / Flagged"
          clickable
          onClick={() => setStatusFilter(ClaimVerificationStatus.UNSUPPORTED)}
          color={statusFilter === ClaimVerificationStatus.UNSUPPORTED ? "error" : "default"}
          size="small"
        />
      </Box>

      {/* Claim-Level Grounding Audit Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", mb: 2 }}>
          Claim-Level Grounding Breakdown ({filteredExtractions.length} audited fields)
        </Typography>

        {filteredExtractions.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No extracted claims match the selected filter. Run AI extraction on the Literature or Extraction page.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {filteredExtractions.map((item) => {
              const cardId = `${item.pmid}_${item.field_name}`;
              const isExpanded = !!expandedCards[cardId];
              const isUnsupported = item.verification_status === ClaimVerificationStatus.UNSUPPORTED;

              return (
                <Card
                  key={cardId}
                  sx={{
                    border: isUnsupported ? "1px solid #FCA5A5" : "1px solid #E2E8F0",
                    borderRadius: 2.5,
                    backgroundColor: isUnsupported ? "#FFFBFB" : "#FFFFFF",
                  }}
                >
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                          <StatusChip status={item.verification_status} size="small" />
                          <Chip
                            label={`PMID: ${item.pmid}`}
                            size="small"
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.7rem",
                              backgroundColor: "#F1F5F9",
                            }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: "#0D9488", fontSize: "0.95rem" }}
                          >
                            {EXTRACTION_FIELD_LABELS[item.field_name] || item.field_name}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A", mt: 0.5 }}>
                          {item.publication_title || `Publication PMID ${item.pmid}`}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontWeight: 700,
                              color: item.grounding_score >= 0.7 ? "#16A34A" : item.grounding_score >= 0.4 ? "#D97706" : "#DC2626",
                            }}
                          >
                            Score: {item.grounding_score.toFixed(2)}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => toggleExpand(cardId)}>
                          {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Extracted value excerpt */}
                    <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: "#F8FAFC", borderRadius: 1.5, border: "1px solid #E2E8F0" }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                        EXTRACTED CLAIM VALUE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "#0F172A", mt: 0.25 }}>
                        {item.extracted_value}
                      </Typography>
                    </Box>

                    {/* Expanded details */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #CBD5E1" }}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                            <FormatQuoteIcon fontSize="small" sx={{ color: "#0D9488" }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>
                              CITED SUPPORTING PASSAGE FROM ABSTRACT
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 1.5,
                              backgroundColor: "#FAFAFA",
                              borderRadius: 1.5,
                              borderLeft: "3px solid #0D9488",
                              fontStyle: "italic",
                              fontSize: "0.825rem",
                              color: "#1E293B",
                            }}
                          >
                            {item.supporting_passage ? `"${item.supporting_passage}"` : "No supporting passage provided."}
                          </Box>
                        </Box>

                        <Box sx={{ p: 1.5, backgroundColor: isUnsupported ? "#FEF2F2" : "#F0FDF4", borderRadius: 1.5, border: isUnsupported ? "1px solid #FEE2E2" : "1px solid #DCFCE7" }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: isUnsupported ? "#991B1B" : "#166534", display: "block" }}>
                            VERIFICATION ENGINE AUDIT EXPLANATION
                          </Typography>
                          <Typography variant="body2" sx={{ color: isUnsupported ? "#B91C1C" : "#15803D", fontSize: "0.8rem", mt: 0.25 }}>
                            {item.verification_notes || "Grounded against PubMed abstract."}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Verification Audit Log DataGrid */}
      <Card sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FactCheckIcon sx={{ color: "#0D9488", fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Full Audit Trail Log ({logs.length} events)
            </Typography>
          </Box>

          <Box sx={{ height: 420, width: "100%" }}>
            <DataGrid
              rows={logs}
              columns={logColumns}
              loading={loading}
              getRowId={(row) => row.id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  color: "#475569",
                },
                "& .MuiDataGrid-row": {
                  borderBottom: "1px solid #F1F5F9",
                  "&:hover": { backgroundColor: "#F8FAFC" },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

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

export default VerificationPage;
