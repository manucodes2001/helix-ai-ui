import React from "react";
import { Chip, Tooltip } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import BlockIcon from "@mui/icons-material/Block";
import { ClaimVerificationStatus, RelationshipStatus } from "../../types/helix";

interface StatusChipProps {
  status: string | null | undefined;
  size?: "small" | "medium";
  tooltip?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = "small",
  tooltip,
}) => {
  const norm = (status || "").trim();

  let label = norm || "Unknown";
  let bg = "#F1F5F9";
  let color = "#475569";
  let border = "#CBD5E1";
  let icon: React.ReactElement | undefined = <HelpOutlinedIcon style={{ fontSize: 14 }} />;

  if (
    norm === ClaimVerificationStatus.VERIFIED ||
    norm === RelationshipStatus.VERIFIED ||
    norm.toLowerCase() === "verified"
  ) {
    label = norm === RelationshipStatus.VERIFIED ? "Verified Link" : "Verified";
    bg = "#DCFCE7";
    color = "#166534";
    border = "#86EFAC";
    icon = <CheckCircleOutlinedIcon style={{ fontSize: 14, color: "#166534" }} />;
  } else if (
    norm === ClaimVerificationStatus.PARTIALLY_SUPPORTED ||
    norm === RelationshipStatus.CANDIDATE ||
    norm.toLowerCase() === "candidate" ||
    norm.toLowerCase() === "partially supported"
  ) {
    label = norm === RelationshipStatus.CANDIDATE ? "Candidate Link" : "Partially Supported";
    bg = "#FEF9C3";
    color = "#854D0E";
    border = "#FDE047";
    icon = <WarningAmberOutlinedIcon style={{ fontSize: 14, color: "#854D0E" }} />;
  } else if (
    norm === ClaimVerificationStatus.UNSUPPORTED ||
    norm.toLowerCase() === "unsupported"
  ) {
    label = "Unsupported";
    bg = "#FEE2E2";
    color = "#991B1B";
    border = "#FCA5A5";
    icon = <ErrorOutlinedIcon style={{ fontSize: 14, color: "#991B1B" }} />;
  } else if (
    norm === ClaimVerificationStatus.SOURCE_UNAVAILABLE ||
    norm.toLowerCase() === "source unavailable"
  ) {
    label = "Source Unavailable";
    bg = "#F3F4F6";
    color = "#6B7280";
    border = "#D1D5DB";
    icon = <BlockIcon style={{ fontSize: 14, color: "#6B7280" }} />;
  } else if (
    norm === RelationshipStatus.NONE ||
    norm.toLowerCase() === "none"
  ) {
    label = "No Link";
    bg = "#F1F5F9";
    color = "#64748B";
    border = "#E2E8F0";
    icon = <BlockIcon style={{ fontSize: 14, color: "#94A3B8" }} />;
  } else {
    // Unverified
    label = "Unverified";
    bg = "#E2E8F0";
    color = "#334155";
    border = "#CBD5E1";
    icon = <HelpOutlinedIcon style={{ fontSize: 14, color: "#475569" }} />;
  }

  const chip = (
    <Chip
      size={size}
      icon={icon}
      label={label}
      sx={{
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontWeight: 600,
        fontSize: size === "small" ? "0.72rem" : "0.8rem",
        height: size === "small" ? 24 : 30,
        "& .MuiChip-icon": {
          marginLeft: "6px",
          marginRight: "-2px",
        },
      }}
    />
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        <span>{chip}</span>
      </Tooltip>
    );
  }

  return chip;
};
