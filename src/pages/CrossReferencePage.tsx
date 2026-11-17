import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import HubIcon from "@mui/icons-material/Hub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { PageHeader } from "../components/layout/PageHeader";
import { StatusChip } from "../components/common/StatusChip";
import { helixApi } from "../api/helixApi";
import { PubGeoRelationship, RelationshipStatus } from "../types/helix";

export const CrossReferencePage: React.FC = () => {
  const [relationships, setRelationships] = useState<PubGeoRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [inspectRel, setInspectRel] = useState<PubGeoRelationship | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchRelationships = async () => {
    try {
      setLoading(true);
      const data = await helixApi.getRelationships();
      setRelationships(data);
    } catch (err: unknown) {
      console.error(err);
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Failed to load relationships.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, []);

  const filteredRelationships = relationships.filter((rel) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "VERIFIED") return rel.verification_status === RelationshipStatus.VERIFIED;
    if (statusFilter === "CANDIDATE") return rel.verification_status === RelationshipStatus.CANDIDATE;
    if (statusFilter === "NONE") return rel.verification_status === RelationshipStatus.NONE;
    return true;
  });

  const verifiedCount = relationships.filter((r) => r.verification_status === RelationshipStatus.VERIFIED).length;
  const candidateCount = relationships.filter((r) => r.verification_status === RelationshipStatus.CANDIDATE).length;
  const noneCount = relationships.filter((r) => r.verification_status === RelationshipStatus.NONE).length;

  const columns: GridColDef<PubGeoRelationship>[] = [
    {
      field: "pmid",
      headerName: "PubMed ID",
      width: 120,
      renderCell: (params: GridRenderCellParams<PubGeoRelationship>) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
            }}
          >
            {params.value}
          </Typography>
          <Tooltip title="Open in PubMed">
            <IconButton
              size="small"
              href={`https://pubmed.ncbi.nlm.nih.gov/${params.value}/`}
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#64748B", p: 0.25 }}
            >
              <OpenInNewIcon style={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "publication_title",
      headerName: "Publication Title",
      flex: 1.5,
      minWidth: 260,
      renderCell: (params: GridRenderCellParams<PubGeoRelationship>) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "#0F172A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={params.value || params.row.pmid}
        >
          {params.value || `PMID ${params.row.pmid}`}
        </Typography>
      ),
    },
    {
      field: "gse_accession",
      headerName: "GEO Accession",
      width: 150,
      renderCell: (params: GridRenderCellParams<PubGeoRelationship>) => {
        const isNone = params.value === "NONE";
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                color: isNone ? "#94A3B8" : "#0D9488",
              }}
            >
              {params.value}
            </Typography>
            {!isNone && (
              <Tooltip title="Open in NCBI GEO">
                <IconButton
                  size="small"
                  href={params.row.geo_url || `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=${params.value}`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ color: "#64748B", p: 0.25 }}
                >
                  <OpenInNewIcon style={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: "relationship_method",
      headerName: "Discovery Method",
      width: 170,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.68rem",
            backgroundColor: "#F1F5F9",
            color: "#334155",
          }}
        />
      ),
    },
    {
      field: "verification_status",
      headerName: "Evidence Status",
      width: 175,
      renderCell: (params) => <StatusChip status={params.value} size="small" />,
    },
    {
      field: "confidence_score",
      headerName: "Confidence",
      width: 150,
      type: "number",
      renderCell: (params: GridRenderCellParams<PubGeoRelationship>) => {
        const score = typeof params.value === "number" ? params.value : 0;
        const pct = Math.round(score * 100);
        const color = score >= 0.8 ? "#16A34A" : score >= 0.5 ? "#D97706" : "#DC2626";

        return (
          <Box sx={{ width: "100%", pr: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
              <Typography
                variant="caption"
                sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color }}
              >
                {score.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                {params.row.uncertainty_indicator}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 5,
                borderRadius: 2.5,
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
      headerName: "Evidence",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<PubGeoRelationship>) => (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={() => {
            setInspectRel(params.row);
            setDialogOpen(true);
          }}
          sx={{ fontSize: "0.72rem", py: 0.25, px: 1, borderColor: "#CBD5E1" }}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Cross-Reference Intelligence & Evidence Mapping"
        subtitle="Multi-evidence verification matching PubMed literature to NCBI GEO datasets using accession regex, NCBI Entrez E-link utilities, and study title correspondence."
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRelationships}
            size="small"
          >
            Refresh
          </Button>
        }
      />

      {/* Filter Tabs / Pills */}
      <Card sx={{ mb: 3, border: "1px solid #E2E8F0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              FILTER BY EVIDENCE STATUS:
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip
                label={`All Links (${relationships.length})`}
                clickable
                onClick={() => setStatusFilter("ALL")}
                color={statusFilter === "ALL" ? "primary" : "default"}
                variant={statusFilter === "ALL" ? "filled" : "outlined"}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                icon={<CheckCircleOutlinedIcon style={{ fontSize: 14 }} />}
                label={`Verified (${verifiedCount})`}
                clickable
                onClick={() => setStatusFilter("VERIFIED")}
                sx={{
                  backgroundColor: statusFilter === "VERIFIED" ? "#DCFCE7" : "transparent",
                  color: "#166534",
                  border: "1px solid #86EFAC",
                  fontWeight: 600,
                }}
                size="small"
              />
              <Chip
                icon={<WarningAmberOutlinedIcon style={{ fontSize: 14 }} />}
                label={`Candidate (${candidateCount})`}
                clickable
                onClick={() => setStatusFilter("CANDIDATE")}
                sx={{
                  backgroundColor: statusFilter === "CANDIDATE" ? "#FEF9C3" : "transparent",
                  color: "#854D0E",
                  border: "1px solid #FDE047",
                  fontWeight: 600,
                }}
                size="small"
              />
              <Chip
                label={`No Identified Link (${noneCount})`}
                clickable
                onClick={() => setStatusFilter("NONE")}
                sx={{
                  backgroundColor: statusFilter === "NONE" ? "#E2E8F0" : "transparent",
                  color: "#475569",
                  border: "1px solid #CBD5E1",
                  fontWeight: 600,
                }}
                size="small"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* DataGrid Table */}
      <Card sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HubIcon sx={{ color: "#0D9488", fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                PubMed ↔ GEO Evidence Matrix ({filteredRelationships.length} matches)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: 580, width: "100%" }}>
            <DataGrid
              rows={filteredRelationships}
              columns={columns}
              loading={loading}
              getRowId={(row) => `${row.pmid}_${row.gse_accession}_${row.relationship_method}`}
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

      {/* Evidence Inspection Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {inspectRel && (
          <>
            <DialogTitle sx={{ pb: 1, borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HubIcon sx={{ color: "#0D9488" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Relationship Evidence Audit
                  </Typography>
                </Box>
                <StatusChip status={inspectRel.verification_status} />
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={2} sx={{ mb: 2.5, mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                      PUBMED PUBLICATION
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", mt: 0.5 }}>
                      PMID: {inspectRel.pmid}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#334155", mt: 0.25, fontSize: "0.825rem" }}>
                      {inspectRel.publication_title || "No publication title stored"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                      NCBI GEO STUDY
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0D9488", mt: 0.5 }}>
                      {inspectRel.gse_accession}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#334155", mt: 0.25, fontSize: "0.825rem" }}>
                      {inspectRel.study_title || "No study title available"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", mb: 0.5 }}>
                  Discovery & Grading Telemetry
                </Typography>
                <Stack direction="row" spacing={2} sx={{ p: 1.5, backgroundColor: "#FAFAFA", borderRadius: 2, border: "1px solid #E2E8F0" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>Method</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                      {inspectRel.relationship_method}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>Confidence Score</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                      {inspectRel.confidence_score.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>Uncertainty</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {inspectRel.uncertainty_indicator}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                  <FormatQuoteIcon fontSize="small" sx={{ color: "#0D9488" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>
                    Supporting Evidence Description
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderLeft: "4px solid #0D9488",
                    fontStyle: "italic",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                >
                  {inspectRel.supporting_evidence || "No textual supporting evidence recorded."}
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
              <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit" size="small">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Toast */}
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

export default CrossReferencePage;
