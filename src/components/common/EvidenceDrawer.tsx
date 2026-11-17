import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import VerifiedIcon from "@mui/icons-material/Verified";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { StatusChip } from "./StatusChip";
import { EXTRACTION_FIELD_LABELS, ExtractedField, Publication } from "../../types/helix";

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  field?: ExtractedField | null;
  publication?: Publication | null;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  open,
  onClose,
  field,
  publication,
}) => {
  const pmid = field?.pmid || publication?.pmid;
  const pubTitle = field?.publication_title || publication?.title;
  const pubJournal = field?.journal || publication?.journal;
  const pubYear = field?.publication_year || publication?.publication_year;
  const pubmedUrl = field?.pubmed_url || publication?.pubmed_url || (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : "");

  const groundingScore = field ? Math.min(Math.max(field.grounding_score, 0), 1) : 0;
  const groundingPercentage = Math.round(groundingScore * 100);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "#16A34A";
    if (score >= 0.5) return "#D97706";
    return "#DC2626";
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 540, md: 620 },
            p: 0,
            backgroundColor: "#FFFFFF",
          },
        },
      }}
    >
      {/* Drawer Header */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              backgroundColor: "rgba(13, 148, 136, 0.1)",
              color: "#0D9488",
              display: "flex",
            }}
          >
            <VerifiedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              Scientific Evidence Inspector
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B" }}>
              Verbatim claim grounding & provenance audit
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#64748B" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Drawer Body */}
      <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
        {/* Publication Metadata Banner */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            backgroundColor: "#F1F5F9",
            border: "1px solid #E2E8F0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Chip
                label={`PMID: ${pmid || "N/A"}`}
                size="small"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 600,
                  backgroundColor: "#0F172A",
                  color: "#FFFFFF",
                }}
              />
              {pubYear && (
                <Chip
                  label={pubYear}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, borderColor: "#CBD5E1" }}
                />
              )}
            </Stack>

            {pubmedUrl && (
              <Button
                variant="text"
                size="small"
                startIcon={<OpenInNewIcon fontSize="small" />}
                href={pubmedUrl}
                target="_blank"
                rel="noreferrer"
                sx={{ fontSize: "0.75rem", p: 0.5 }}
              >
                PubMed Record
              </Button>
            )}
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0F172A", mb: 0.5, lineHeight: 1.35 }}>
            {pubTitle || "No title available"}
          </Typography>

          {pubJournal && (
            <Typography variant="body2" sx={{ color: "#64748B", fontStyle: "italic", fontSize: "0.8rem" }}>
              {pubJournal}
            </Typography>
          )}
        </Box>

        {/* Claim Details (if viewing an extraction) */}
        {field && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B", fontSize: "0.725rem" }}>
                Extracted Field Target
              </Typography>
              <StatusChip status={field.verification_status} size="small" />
            </Box>

            <Typography variant="h6" sx={{ color: "#0D9488", fontWeight: 700, mb: 1 }}>
              {EXTRACTION_FIELD_LABELS[field.field_name] || field.field_name}
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                mb: 2,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", display: "block", mb: 0.5 }}>
                EXTRACTED SCIENTIFIC VALUE
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "#0F172A",
                  whiteSpace: "pre-wrap",
                }}
              >
                {field.extracted_value}
              </Typography>
            </Box>

            {/* Verbatim Supporting Passage Quote */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
                <FormatQuoteIcon fontSize="small" sx={{ color: "#0D9488" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>
                  Verbatim Source Passage
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#F8FAFC",
                  borderLeft: "4px solid #0D9488",
                  borderTop: "1px solid #E2E8F0",
                  borderRight: "1px solid #E2E8F0",
                  borderBottom: "1px solid #E2E8F0",
                  fontStyle: "italic",
                  color: "#1E293B",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                {field.supporting_passage ? (
                  `"${field.supporting_passage}"`
                ) : (
                  <Typography variant="body2" sx={{ color: "#94A3B8", fontStyle: "italic" }}>
                    No supporting passage was cited by the extraction model.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Grounding Score & Audit Metrics */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                mb: 2.5,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.8rem" }}>
                  Claim-Level Grounding Score
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    color: getScoreColor(groundingScore),
                  }}
                >
                  {field.grounding_score.toFixed(2)} ({groundingPercentage}%)
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={groundingPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#E2E8F0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getScoreColor(groundingScore),
                    borderRadius: 4,
                  },
                  mb: 1.5,
                }}
              />

              {field.verification_notes && (
                <Box sx={{ pt: 1, borderTop: "1px dashed #CBD5E1" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", display: "block" }}>
                    AUDIT EXPLANATION
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.8rem", mt: 0.25 }}>
                    {field.verification_notes}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Full Publication Abstract */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <MenuBookIcon fontSize="small" sx={{ color: "#64748B" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A" }}>
              Full Publication Abstract
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#FAFAFA",
              border: "1px solid #E2E8F0",
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#334155",
                lineHeight: 1.6,
                fontSize: "0.825rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {publication?.abstract || "Abstract not available for this record."}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Drawer Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#F8FAFC",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button variant="outlined" color="inherit" onClick={onClose} size="small">
          Close Inspector
        </Button>
      </Box>
    </Drawer>
  );
};
