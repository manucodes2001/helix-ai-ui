import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import StorageIcon from "@mui/icons-material/Storage";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { helixApi } from "../../api/helixApi";
import { PipelineRunSummary } from "../../types/helix";

interface PipelineRunnerCardProps {
  onRunComplete?: (summary: PipelineRunSummary) => void;
}

const PRESET_QUERIES = [
  "Gene expression in breast cancer",
  "Alzheimer's disease biomarkers",
  "Type 2 diabetes transcriptomics",
  "Single-cell RNA-seq in glioblastoma",
];

export const PipelineRunnerCard: React.FC<PipelineRunnerCardProps> = ({
  onRunComplete,
}) => {
  const [query, setQuery] = useState("Gene expression in breast cancer");
  const [maxResults, setMaxResults] = useState(10);
  const [linkGeo, setLinkGeo] = useState(true);
  const [runExtraction, setRunExtraction] = useState(false);
  const [remoteIdVerify, setRemoteIdVerify] = useState(false);

  const [loading, setLoading] = useState(false);
  const [lastSummary, setLastSummary] = useState<PipelineRunSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setLastSummary(null);

    try {
      const summary = await helixApi.runPipeline({
        query: query.trim(),
        max_results: maxResults,
        link_geo: linkGeo,
        run_extraction: runExtraction,
        remote_id_verify: remoteIdVerify,
      });

      setLastSummary(summary);
      if (onRunComplete) {
        onRunComplete(summary);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pipeline execution failed.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      {/* Accent gradient top header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0D9488 100%)",
          px: 3,
          py: 2.5,
          color: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
            }}
          >
            <AutoAwesomeIcon sx={{ color: "#2DD4BF", fontSize: "1.25rem" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Autonomous Scientific Research Pipeline
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#CBD5E1", fontSize: "0.85rem" }}>
          Query PubMed literature, discover NCBI GEO gene expression series, map multi-evidence relationships, and execute claim-grounded AI extraction.
        </Typography>
      </Box>

      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Preset Query Pills */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block", mb: 0.75 }}>
            EXAMPLE RESEARCH PROMPTS:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {PRESET_QUERIES.map((preset) => (
              <Chip
                key={preset}
                label={preset}
                size="small"
                clickable
                onClick={() => setQuery(preset)}
                sx={{
                  backgroundColor: query === preset ? "rgba(13, 148, 136, 0.12)" : "#F1F5F9",
                  color: query === preset ? "#0D9488" : "#475569",
                  fontWeight: query === preset ? 700 : 500,
                  border: query === preset ? "1px solid #0D9488" : "1px solid #E2E8F0",
                  "&:hover": {
                    backgroundColor: "rgba(13, 148, 136, 0.18)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Query Input Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Enter disease, gene, pathway, or biomedical query (e.g., 'BRCA1 methylation ovarian cancer')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleExecute();
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#0D9488" }} />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: "0.95rem",
                  borderRadius: 2,
                  backgroundColor: "#F8FAFC",
                },
              },
            }}
          />
        </Box>

        {/* Options & Sliders */}
        <Grid container spacing={3} sx={{ alignItems: "center", mb: 2.5 }}>
          {/* Max papers slider */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ px: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>
                  RETRIEVAL DEPTH
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    color: "#0D9488",
                  }}
                >
                  {maxResults} publications
                </Typography>
              </Box>
              <Slider
                value={maxResults}
                min={1}
                max={30}
                step={1}
                onChange={(_, val) => setMaxResults(val as number)}
                valueLabelDisplay="auto"
                sx={{
                  color: "#0D9488",
                  "& .MuiSlider-thumb": {
                    width: 16,
                    height: 16,
                  },
                }}
              />
            </Box>
          </Grid>

          {/* Engine Toggles */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={linkGeo}
                    onChange={(e) => setLinkGeo(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <StorageIcon sx={{ fontSize: 16, color: "#64748B" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.825rem" }}>
                      Link GEO Datasets
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={runExtraction}
                    onChange={(e) => setRunExtraction(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 16, color: "#64748B" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.825rem" }}>
                      AI Extraction
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={remoteIdVerify}
                    onChange={(e) => setRemoteIdVerify(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <FactCheckIcon sx={{ fontSize: 16, color: "#64748B" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.825rem" }}>
                      Remote ID Verify
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>
        </Grid>

        {/* Run Action CTA */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1, borderTop: "1px solid #E2E8F0" }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleExecute}
            disabled={loading || !query.trim()}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
            sx={{
              px: 3.5,
              py: 1,
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: 2,
              backgroundColor: "#0D9488",
              "&:hover": {
                backgroundColor: "#0F766E",
              },
            }}
          >
            {loading ? "Executing Pipeline..." : "Execute Research Pipeline"}
          </Button>
        </Box>

        {/* Execution Error Feedback */}
        {errorMsg && (
          <Alert severity="error" sx={{ mt: 2.5, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Pipeline Execution Error:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem", mt: 0.25 }}>
              {errorMsg}
            </Typography>
          </Alert>
        )}

        {/* Execution Success Telemetry Banner */}
        {lastSummary && (
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 2,
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <CheckCircleOutlinedIcon sx={{ color: "#16A34A", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#166534" }}>
                Pipeline Execution Complete: "{lastSummary.query}"
              </Typography>
            </Box>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Box sx={{ p: 1, backgroundColor: "#FFFFFF", borderRadius: 1.5, border: "1px solid #DCFCE7", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                    PUBMED HITS
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                    {lastSummary.total_pubmed_hits}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Box sx={{ p: 1, backgroundColor: "#FFFFFF", borderRadius: 1.5, border: "1px solid #DCFCE7", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                    RETRIEVED
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                    {lastSummary.retrieved_publications}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Box sx={{ p: 1, backgroundColor: "#FFFFFF", borderRadius: 1.5, border: "1px solid #DCFCE7", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                    NEW PAPERS
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#166534", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                    +{lastSummary.newly_inserted_publications}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Box sx={{ p: 1, backgroundColor: "#FFFFFF", borderRadius: 1.5, border: "1px solid #DCFCE7", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                    GEO DISCOVERED
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#0D9488", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                    {lastSummary.geo_links_discovered} ({lastSummary.verified_geo_links} verified)
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Box sx={{ p: 1, backgroundColor: "#FFFFFF", borderRadius: 1.5, border: "1px solid #DCFCE7", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                    AI EXTRACTED
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#2563EB", fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                    {lastSummary.extracted_publications} papers
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {lastSummary.errors && lastSummary.errors.length > 0 && (
              <Box sx={{ mt: 1.5, p: 1, backgroundColor: "#FEF2F2", borderRadius: 1, border: "1px solid #FEE2E2" }}>
                <Typography variant="caption" sx={{ color: "#991B1B", fontWeight: 700, display: "block" }}>
                  Notices & Non-fatal Exceptions ({lastSummary.errors.length}):
                </Typography>
                {lastSummary.errors.map((err, i) => (
                  <Typography key={i} variant="caption" sx={{ color: "#B91C1C", display: "block" }}>
                    • {err}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
