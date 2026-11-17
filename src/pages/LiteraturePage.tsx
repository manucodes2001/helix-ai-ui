import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
import HubIcon from "@mui/icons-material/Hub";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PageHeader } from "../components/layout/PageHeader";
import { EvidenceDrawer } from "../components/common/EvidenceDrawer";
import { helixApi } from "../api/helixApi";
import { Publication } from "../types/helix";

export const LiteraturePage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [actionLoadingPmid, setActionLoadingPmid] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchPublications = async (query?: string) => {
    try {
      setLoading(true);
      const data = await helixApi.getPublications(query);
      setPublications(data);
    } catch (err: unknown) {
      console.error(err);
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Failed to load publications.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublications(searchQuery);
  };

  const handleCrossReference = async (pmid: string) => {
    setActionLoadingPmid(pmid);
    try {
      const rels = await helixApi.crossReferencePublication(pmid);
      setToast({
        open: true,
        message: `Cross-reference complete for PMID ${pmid}! Discovered ${rels.length} relationship(s).`,
        severity: "success",
      });
    } catch (err: unknown) {
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Cross-reference failed.",
        severity: "error",
      });
    } finally {
      setActionLoadingPmid(null);
    }
  };

  const handleExtract = async (pmid: string) => {
    setActionLoadingPmid(pmid);
    try {
      const fields = await helixApi.extractPublication(pmid);
      setToast({
        open: true,
        message: `AI extraction and grounding verification complete for PMID ${pmid} (${fields.length} scientific fields)!`,
        severity: "success",
      });
    } catch (err: unknown) {
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "AI extraction failed.",
        severity: "error",
      });
    } finally {
      setActionLoadingPmid(null);
    }
  };

  const columns: GridColDef<Publication>[] = [
    {
      field: "pmid",
      headerName: "PMID",
      width: 120,
      renderCell: (params: GridRenderCellParams<Publication>) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            {params.value}
          </Typography>
          <Tooltip title="View in PubMed">
            <IconButton
              size="small"
              href={params.row.pubmed_url || `https://pubmed.ncbi.nlm.nih.gov/${params.value}/`}
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
      field: "title",
      headerName: "Publication Title",
      flex: 1.8,
      minWidth: 300,
      renderCell: (params: GridRenderCellParams<Publication>) => (
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
      field: "journal",
      headerName: "Journal",
      width: 170,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#475569", fontStyle: "italic" }}>
          {params.value || "—"}
        </Typography>
      ),
    },
    {
      field: "publication_year",
      headerName: "Year",
      width: 85,
      type: "number",
      renderCell: (params) => (
        <Chip
          label={params.value || "—"}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, borderColor: "#CBD5E1" }}
        />
      ),
    },
    {
      field: "source_query",
      headerName: "Source Query",
      width: 160,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: "#64748B" }}>
          {params.value || "—"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 280,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Publication>) => {
        const isBusy = actionLoadingPmid === params.row.pmid;
        return (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<VisibilityIcon fontSize="small" />}
              onClick={() => {
                setSelectedPub(params.row);
                setDrawerOpen(true);
              }}
              sx={{ fontSize: "0.72rem", py: 0.25, px: 1, borderColor: "#CBD5E1" }}
            >
              Abstract
            </Button>

            <Tooltip title="Link to NCBI GEO datasets">
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                disabled={isBusy}
                startIcon={isBusy ? <CircularProgress size={12} /> : <HubIcon fontSize="small" />}
                onClick={() => handleCrossReference(params.row.pmid)}
                sx={{ fontSize: "0.72rem", py: 0.25, px: 1 }}
              >
                GEO Link
              </Button>
            </Tooltip>

            <Tooltip title="Extract 10 scientific fields + verify grounding">
              <Button
                size="small"
                variant="contained"
                color="primary"
                disabled={isBusy}
                startIcon={isBusy ? <CircularProgress size={12} color="inherit" /> : <AutoAwesomeIcon fontSize="small" />}
                onClick={() => handleExtract(params.row.pmid)}
                sx={{ fontSize: "0.72rem", py: 0.25, px: 1 }}
              >
                AI Extract
              </Button>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="PubMed Scientific Literature"
        subtitle="Explore peer-reviewed indexed publications, inspect biomedical abstracts, and trigger multi-evidence GEO linking or structured AI extraction."
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchPublications(searchQuery)}
            size="small"
          >
            Refresh
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, border: "1px solid #E2E8F0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <form onSubmit={handleSearchSubmit}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Filter stored publications by title, abstract keyword, PMID, or query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#0D9488", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, backgroundColor: "#F8FAFC" },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ minWidth: 100, height: 40, borderRadius: 2 }}
              >
                Filter
              </Button>
              {searchQuery && (
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    setSearchQuery("");
                    fetchPublications("");
                  }}
                  sx={{ height: 40 }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* DataGrid Table */}
      <Card sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Stored Publications Dataset ({publications.length} records)
            </Typography>
          </Box>

          <Box sx={{ height: 580, width: "100%" }}>
            <DataGrid
              rows={publications}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.pmid}
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

      {/* Evidence Slide-over Drawer for Abstract Viewing */}
      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        publication={selectedPub}
      />

      {/* Toast Notification */}
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

export default LiteraturePage;
