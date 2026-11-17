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
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StorageIcon from "@mui/icons-material/Storage";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PageHeader } from "../components/layout/PageHeader";
import { helixApi } from "../api/helixApi";
import { GEOStudy } from "../types/helix";

export const GeoDiscoveryPage: React.FC = () => {
  const [geoStudies, setGeoStudies] = useState<GEOStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupAccession, setLookupAccession] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  const [selectedStudy, setSelectedStudy] = useState<GEOStudy | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const data = await helixApi.getGeoStudies();
      setGeoStudies(data);
    } catch (err: unknown) {
      console.error(err);
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Failed to load GEO studies.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const gse = lookupAccession.trim().toUpperCase();
    if (!gse) return;

    setLookupLoading(true);
    try {
      const study = await helixApi.lookupGeoStudy({ gse_accession: gse });
      setToast({
        open: true,
        message: `Discovered and persisted ${study.gse_accession}: "${study.study_title}"`,
        severity: "success",
      });
      setLookupAccession("");
      fetchStudies();
      setSelectedStudy(study);
      setDrawerOpen(true);
    } catch (err: unknown) {
      setToast({
        open: true,
        message: err instanceof Error ? err.message : `Failed to lookup ${gse}`,
        severity: "error",
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const columns: GridColDef<GEOStudy>[] = [
    {
      field: "gse_accession",
      headerName: "GSE Accession",
      width: 150,
      renderCell: (params: GridRenderCellParams<GEOStudy>) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              color: "#0D9488",
            }}
          >
            {params.value}
          </Typography>
          <Tooltip title="View in NCBI GEO">
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
        </Box>
      ),
    },
    {
      field: "study_title",
      headerName: "Study Title",
      flex: 1.8,
      minWidth: 280,
      renderCell: (params: GridRenderCellParams<GEOStudy>) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
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
      field: "organism",
      headerName: "Organism",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || "Not specified"}
          size="small"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 600,
            backgroundColor: "#F1F5F9",
            color: "#334155",
          }}
        />
      ),
    },
    {
      field: "platform",
      headerName: "Platform (GPL)",
      width: 140,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.8rem",
            color: "#475569",
          }}
        >
          {params.value || "—"}
        </Typography>
      ),
    },
    {
      field: "sample_count",
      headerName: "Samples",
      width: 95,
      type: "number",
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}
        >
          {params.value ?? "—"}
        </Typography>
      ),
    },
    {
      field: "associated_pmids",
      headerName: "Associated PMIDs",
      width: 160,
      renderCell: (params) => {
        const pmids = (params.value || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        return (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            {pmids.slice(0, 2).map((pmid: string) => (
              <Chip
                key={pmid}
                label={pmid}
                size="small"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.68rem",
                  height: 20,
                  backgroundColor: "#E2E8F0",
                }}
              />
            ))}
            {pmids.length > 2 && (
              <Chip
                label={`+${pmids.length - 2}`}
                size="small"
                sx={{ fontSize: "0.68rem", height: 20 }}
              />
            )}
          </Stack>
        );
      },
    },
    {
      field: "actions",
      headerName: "Details",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<GEOStudy>) => (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<VisibilityIcon fontSize="small" />}
          onClick={() => {
            setSelectedStudy(params.row);
            setDrawerOpen(true);
          }}
          sx={{ fontSize: "0.72rem", py: 0.25, px: 1, borderColor: "#CBD5E1" }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="NCBI GEO Dataset Discovery"
        subtitle="Search and explore Gene Expression Omnibus (GEO) GSE series, examine microarray and RNA-seq platform identifiers, and review experimental design."
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStudies}
            size="small"
          >
            Refresh
          </Button>
        }
      />

      {/* GSE Accession Direct Lookup Card */}
      <Card sx={{ mb: 3, border: "1px solid #E2E8F0" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <StorageIcon sx={{ color: "#0D9488", fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Direct GSE Accession Lookup via NCBI E-utilities
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B", mb: 2, fontSize: "0.825rem" }}>
            Query NCBI GDS database directly by GSE accession (e.g., <code>GSE15824</code>, <code>GSE19804</code>, <code>GSE18842</code>).
          </Typography>

          <form onSubmit={handleLookup}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Enter GSE Accession (e.g. GSE15824)..."
                value={lookupAccession}
                onChange={(e) => setLookupAccession(e.target.value)}
                sx={{ maxWidth: 380, width: "100%" }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#0D9488", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, backgroundColor: "#F8FAFC", fontFamily: '"JetBrains Mono", monospace' },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={lookupLoading || !lookupAccession.trim()}
                startIcon={lookupLoading ? <CircularProgress size={16} color="inherit" /> : <StorageIcon />}
                sx={{ height: 40, borderRadius: 2 }}
              >
                {lookupLoading ? "Querying NCBI..." : "Lookup & Store"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* GEO Studies DataGrid */}
      <Card sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Discovered GEO Studies ({geoStudies.length} records)
            </Typography>
          </Box>

          <Box sx={{ height: 550, width: "100%" }}>
            <DataGrid
              rows={geoStudies}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.gse_accession}
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

      {/* GEO Study Detail Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { width: { xs: "100%", sm: 540, md: 620 }, backgroundColor: "#FFFFFF" },
          },
        }}
      >
        {selectedStudy && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                p: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StorageIcon sx={{ color: "#0D9488" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  GEO Series Inspector
                </Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                  <Chip
                    label={selectedStudy.gse_accession}
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 800,
                      backgroundColor: "#0D9488",
                      color: "#FFFFFF",
                    }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<OpenInNewIcon fontSize="small" />}
                    href={selectedStudy.geo_url}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ fontSize: "0.75rem", py: 0.25 }}
                  >
                    Open NCBI GEO
                  </Button>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>
                  {selectedStudy.study_title}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                    ORGANISM
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                    {selectedStudy.organism || "Unspecified"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                    SAMPLE COUNT
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                    {selectedStudy.sample_count ?? "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                    PLATFORM (GPL)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                    {selectedStudy.platform || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                    GDS UID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {selectedStudy.gds_uid || "—"}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155", mb: 0.5 }}>
                  Study Summary
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    color: "#334155",
                    fontSize: "0.85rem",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedStudy.study_summary || "No summary provided in NCBI metadata."}
                </Box>
              </Box>

              {selectedStudy.associated_pmids && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155", mb: 1 }}>
                    Associated PubMed Identifiers
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedStudy.associated_pmids.split(",").map((p) => {
                      const clean = p.trim();
                      if (!clean) return null;
                      return (
                        <Chip
                          key={clean}
                          label={`PMID: ${clean}`}
                          clickable
                          component="a"
                          href={`https://pubmed.ncbi.nlm.nih.gov/${clean}/`}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.75rem",
                            backgroundColor: "#F1F5F9",
                            "&:hover": { backgroundColor: "#E2E8F0" },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ p: 2, borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outlined" color="inherit" onClick={() => setDrawerOpen(false)} size="small">
                Close
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

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

export default GeoDiscoveryPage;
