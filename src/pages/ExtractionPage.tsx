import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import { PageHeader } from "../components/layout/PageHeader";
import { StatusChip } from "../components/common/StatusChip";
import { EvidenceDrawer } from "../components/common/EvidenceDrawer";
import { helixApi } from "../api/helixApi";
import {
  EXTRACTION_FIELD_LABELS,
  ExtractedField,
  Publication,
} from "../types/helix";

export const ExtractionPage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [selectedPmid, setSelectedPmid] = useState<string>("");
  const [extractions, setExtractions] = useState<ExtractedField[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);

  const [inspectField, setInspectField] = useState<ExtractedField | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load publication list
  const loadPublications = async () => {
    try {
      const pubs = await helixApi.getPublications();
      setPublications(pubs);
      if (pubs.length > 0 && !selectedPmid) {
        setSelectedPmid(pubs[0].pmid);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Load extractions for selected PMID or all
  const loadExtractions = async (pmid?: string) => {
    try {
      setLoading(true);
      const data = await helixApi.getExtractions(pmid || undefined);
      setExtractions(data);
    } catch (err: unknown) {
      console.error(err);
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Failed to load extraction fields.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    if (selectedPmid) {
      loadExtractions(selectedPmid);
    } else {
      loadExtractions();
    }
  }, [selectedPmid]);

  const handleRunExtraction = async () => {
    if (!selectedPmid) return;
    setExtracting(true);
    try {
      const updatedFields = await helixApi.extractPublication(selectedPmid);
      setExtractions(updatedFields);
      setToast({
        open: true,
        message: `Extracted and verified 10 scientific fields for PMID ${selectedPmid}!`,
        severity: "success",
      });
    } catch (err: unknown) {
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Extraction execution failed.",
        severity: "error",
      });
    } finally {
      setExtracting(false);
    }
  };

  const selectedPubObj = publications.find((p) => p.pmid === selectedPmid);

  const verifiedCount = extractions.filter((f) => f.verification_status === "Verified").length;
  const partiallyCount = extractions.filter((f) => f.verification_status === "Partially supported").length;
  const unsupportedCount = extractions.filter((f) => f.verification_status === "Unsupported").length;

  const columns: GridColDef<ExtractedField>[] = [
    {
      field: "field_name",
      headerName: "Scientific Target Field",
      width: 220,
      renderCell: (params: GridRenderCellParams<ExtractedField>) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0D9488" }}>
          {EXTRACTION_FIELD_LABELS[params.value] || params.value}
        </Typography>
      ),
    },
    {
      field: "extracted_value",
      headerName: "Extracted Value",
      flex: 1.6,
      minWidth: 260,
      renderCell: (params: GridRenderCellParams<ExtractedField>) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "#0F172A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={params.value}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "supporting_passage",
      headerName: "Verbatim Passage Quote",
      flex: 1.6,
      minWidth: 260,
      renderCell: (params: GridRenderCellParams<ExtractedField>) => (
        <Typography
          variant="body2"
          sx={{
            fontStyle: "italic",
            color: "#475569",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: params.value ? "inherit" : '"JetBrains Mono", monospace',
          }}
          title={params.value}
        >
          {params.value ? `"${params.value}"` : "None"}
        </Typography>
      ),
    },
    {
      field: "verification_status",
      headerName: "Claim Grounding",
      width: 175,
      renderCell: (params) => <StatusChip status={params.value} size="small" />,
    },
    {
      field: "grounding_score",
      headerName: "Score",
      width: 110,
      type: "number",
      renderCell: (params: GridRenderCellParams<ExtractedField>) => {
        const score = typeof params.value === "number" ? params.value : 0;
        const color = score >= 0.8 ? "#16A34A" : score >= 0.5 ? "#D97706" : "#DC2626";
        return (
          <Box sx={{ width: "100%", pr: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color }}
            >
              {score.toFixed(2)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.round(score * 100)}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: "#E2E8F0",
                "& .MuiLinearProgress-bar": { backgroundColor: color },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Audit",
      width: 95,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ExtractedField>) => (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<VisibilityIcon fontSize="small" />}
          onClick={() => {
            setInspectField(params.row);
            setDrawerOpen(true);
          }}
          sx={{ fontSize: "0.72rem", py: 0.25, px: 1, borderColor: "#CBD5E1" }}
        >
          Audit
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="AI-Powered Structured Scientific Extraction"
        subtitle="10-field structured biomedical entity and finding extraction with exact verbatim source text grounding and hallucination prevention."
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadExtractions(selectedPmid)}
            size="small"
          >
            Refresh
          </Button>
        }
      />

      {/* Target Publication Selection Card */}
      <Card sx={{ mb: 3, border: "1px solid #E2E8F0" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="pub-select-label">Select Target Publication</InputLabel>
                <Select
                  labelId="pub-select-label"
                  value={selectedPmid}
                  label="Select Target Publication"
                  onChange={(e) => setSelectedPmid(e.target.value)}
                  sx={{ borderRadius: 2, backgroundColor: "#F8FAFC" }}
                >
                  {publications.map((pub) => (
                    <MenuItem key={pub.pmid} value={pub.pmid}>
                      <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, mr: 1, display: "inline" }}>
                        PMID: {pub.pmid}
                      </Typography>
                      — {pub.title.substring(0, 75)}...
                    </MenuItem>
                  ))}
                  {publications.length === 0 && (
                    <MenuItem value="" disabled>
                      No publications in repository. Run pipeline on Home page first.
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 1.5, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                <Button
                  variant="contained"
                  disabled={extracting || !selectedPmid}
                  startIcon={extracting ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                  onClick={handleRunExtraction}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#0D9488",
                    "&:hover": { backgroundColor: "#0F766E" },
                    height: 40,
                    px: 2.5,
                  }}
                >
                  {extracting ? "Extracting & Grounding..." : "Run AI Extraction"}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Selected Publication Brief */}
          {selectedPubObj && (
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #E2E8F0" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                {selectedPubObj.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748B", mt: 0.25, display: "block" }}>
                {selectedPubObj.authors} • <em>{selectedPubObj.journal}</em> ({selectedPubObj.publication_year || "—"})
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Extraction Quality Metrics Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#DCFCE7",
              border: "1px solid #86EFAC",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <CheckCircleOutlinedIcon sx={{ color: "#166534" }} />
            <Box>
              <Typography variant="caption" sx={{ color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>
                VERIFIED GROUNDED
              </Typography>
              <Typography variant="h6" sx={{ color: "#14532D", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                {verifiedCount} fields
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#FEF9C3",
              border: "1px solid #FDE047",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <WarningAmberIcon sx={{ color: "#854D0E" }} />
            <Box>
              <Typography variant="caption" sx={{ color: "#854D0E", fontWeight: 700, textTransform: "uppercase" }}>
                PARTIALLY SUPPORTED
              </Typography>
              <Typography variant="h6" sx={{ color: "#713F12", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                {partiallyCount} fields
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#FEE2E2",
              border: "1px solid #FCA5A5",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <ErrorOutlinedIcon sx={{ color: "#991B1B" }} />
            <Box>
              <Typography variant="caption" sx={{ color: "#991B1B", fontWeight: 700, textTransform: "uppercase" }}>
                UNSUPPORTED / HALLUCINATED
              </Typography>
              <Typography variant="h6" sx={{ color: "#7F1D1D", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                {unsupportedCount} fields
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Structured Extraction DataGrid */}
      <Card sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesomeIcon sx={{ color: "#0D9488", fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                Structured Scientific Extraction Schema ({extractions.length} fields)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: 560, width: "100%" }}>
            <DataGrid
              rows={extractions}
              columns={columns}
              loading={loading}
              getRowId={(row) => `${row.pmid}_${row.field_name}`}
              pageSizeOptions={[10, 20]}
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

      {/* Detailed Evidence Slide-over Drawer */}
      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        field={inspectField}
        publication={selectedPubObj}
      />

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

export default ExtractionPage;
