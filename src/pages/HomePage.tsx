import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StorageIcon from "@mui/icons-material/Storage";
import HubIcon from "@mui/icons-material/Hub";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import HistoryIcon from "@mui/icons-material/History";
import { MetricCard } from "../components/common/MetricCard";
import { PipelineRunnerCard } from "../components/pipeline/PipelineRunnerCard";
import { PageHeader } from "../components/layout/PageHeader";
import { helixApi } from "../api/helixApi";
import { DashboardStats, PipelineRunSummary, SearchRecord } from "../types/helix";

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await helixApi.getDashboard();
      setStats(data.stats);
      setRecentSearches(data.recent_searches || []);
    } catch (err: unknown) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handlePipelineComplete = (summary: PipelineRunSummary) => {
    loadDashboard();
    setToast({
      open: true,
      message: `Pipeline finished! Retrieved ${summary.retrieved_publications} papers, found ${summary.geo_links_discovered} GEO links.`,
      severity: "success",
    });
  };

  const verifiedPercent =
    stats && stats.total_extracted_fields > 0
      ? Math.round((stats.verified_extracted_fields / stats.total_extracted_fields) * 100)
      : 0;

  const searchColumns: GridColDef<SearchRecord>[] = [
    {
      field: "query_text",
      headerName: "Research Query",
      flex: 1.5,
      minWidth: 220,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "db_source",
      headerName: "Database",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value?.toUpperCase() || "PUBMED"}
          size="small"
          sx={{
            fontSize: "0.68rem",
            fontWeight: 700,
            backgroundColor: "#F1F5F9",
            color: "#475569",
          }}
        />
      ),
    },
    {
      field: "total_found",
      headerName: "Hits",
      width: 100,
      type: "number",
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}
        >
          {params.value?.toLocaleString() || 0}
        </Typography>
      ),
    },
    {
      field: "retrieved_count",
      headerName: "Retrieved",
      width: 110,
      type: "number",
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: "#0D9488" }}
        >
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: "duplicates_skipped",
      headerName: "De-duplicated",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: "created_at",
      headerName: "Executed At",
      width: 180,
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
        title="Scientific Research Intelligence Dashboard"
        subtitle="End-to-end biomedical literature ingestion, multi-evidence GEO dataset discovery, and claim-level grounding audit."
      />

      {/* 4 Executive KPI Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="PubMed Publications"
            value={stats?.publications_count}
            subtitle="Indexed peer-reviewed papers"
            icon={<MenuBookIcon />}
            loading={loading}
            accentColor="#0D9488"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="GEO Studies Discovered"
            value={stats?.geo_studies_count}
            subtitle="NCBI Gene Expression series"
            icon={<StorageIcon />}
            loading={loading}
            accentColor="#1E3A5F"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Verified GEO Links"
            value={stats?.verified_geo_links}
            subtitle="Proven accession citations"
            delta={`${stats?.candidate_geo_links || 0} candidate`}
            deltaType="warning"
            icon={<HubIcon />}
            loading={loading}
            accentColor="#16A34A"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Grounded Claim Fields"
            value={stats ? `${stats.verified_extracted_fields}/${stats.total_extracted_fields}` : undefined}
            subtitle={`${stats?.unsupported_extracted_fields || 0} flagged unsupported`}
            delta={`${verifiedPercent}% verified`}
            deltaType={verifiedPercent >= 75 ? "positive" : "warning"}
            icon={<FactCheckIcon />}
            loading={loading}
            accentColor="#D97706"
          />
        </Grid>
      </Grid>

      {/* Hero Pipeline Runner Card */}
      <Box sx={{ mb: 4 }}>
        <PipelineRunnerCard onRunComplete={handlePipelineComplete} />
      </Box>

      {/* Recent Searches Table Card */}
      <Card sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <HistoryIcon sx={{ color: "#0D9488", fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              Recent Literature Searches & Telemetry
            </Typography>
          </Box>

          <Box sx={{ height: 350, width: "100%" }}>
            <DataGrid
              rows={recentSearches}
              columns={searchColumns}
              loading={loading}
              getRowId={(row) => row.id}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
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
                  letterSpacing: "0.04em",
                  color: "#475569",
                },
                "& .MuiDataGrid-row": {
                  borderBottom: "1px solid #F1F5F9",
                  "&:hover": {
                    backgroundColor: "#F8FAFC",
                  },
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

export default HomePage;
