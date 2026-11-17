import React from "react";
import { Box, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  badge,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        mb: 3,
        pb: 2,
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: "#0F172A",
              fontSize: { xs: "1.4rem", sm: "1.65rem" },
            }}
          >
            {title}
          </Typography>
          {badge}
        </Box>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "#64748B",
              mt: 0.5,
              fontSize: "0.85rem",
              maxWidth: 780,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};
