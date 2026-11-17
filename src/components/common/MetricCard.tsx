import React from "react";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";

interface MetricCardProps {
  title: string;
  value: string | number | undefined;
  subtitle?: string;
  delta?: string;
  deltaType?: "positive" | "warning" | "negative" | "neutral";
  icon: React.ReactNode;
  loading?: boolean;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  delta,
  deltaType = "neutral",
  icon,
  loading = false,
  accentColor = "#0D9488",
}) => {
  const getDeltaColors = () => {
    switch (deltaType) {
      case "positive":
        return { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" };
      case "warning":
        return { bg: "#FEF9C3", text: "#854D0E", border: "#FDE047" };
      case "negative":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" };
      default:
        return { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
    }
  };

  const deltaStyle = getDeltaColors();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
          transform: "translateY(-1px)",
        },
      }}
    >
      {/* Top accent line */}
      <Box
        sx={{
          height: 3,
          width: "100%",
          backgroundColor: accentColor,
        }}
      />
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.725rem",
              color: "#64748B",
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: `${accentColor}12`,
              color: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>

        {loading ? (
          <>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={20} />
          </>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.85rem",
                lineHeight: 1.1,
                mb: 1,
              }}
            >
              {value !== undefined ? value : "—"}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              {delta && (
                <Box
                  sx={{
                    px: 0.9,
                    py: 0.2,
                    borderRadius: 1,
                    fontSize: "0.725rem",
                    fontWeight: 600,
                    backgroundColor: deltaStyle.bg,
                    color: deltaStyle.text,
                    border: `1px solid ${deltaStyle.border}`,
                  }}
                >
                  {delta}
                </Box>
              )}
              {subtitle && (
                <Typography variant="body2" sx={{ fontSize: "0.775rem", color: "#64748B" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
