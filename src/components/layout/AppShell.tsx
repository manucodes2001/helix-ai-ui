import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Chip,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HubIcon from "@mui/icons-material/Hub";
import StorageIcon from "@mui/icons-material/Storage";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import DownloadIcon from "@mui/icons-material/Download";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyIcon from "@mui/icons-material/Key";
import SpeedIcon from "@mui/icons-material/Speed";
import { helixApi } from "../../api/helixApi";
import { HealthResponse } from "../../types/helix";

const DRAWER_WIDTH = 250;
const COLLAPSED_WIDTH = 72;

const NAV_ITEMS = [
  { label: "Home Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "PubMed Literature", path: "/literature", icon: <MenuBookIcon /> },
  { label: "GEO Discovery", path: "/geo", icon: <StorageIcon /> },
  { label: "Cross-Reference", path: "/cross-reference", icon: <HubIcon /> },
  { label: "AI Extraction", path: "/extraction", icon: <AutoAwesomeIcon /> },
  { label: "Evidence Verification", path: "/verification", icon: <FactCheckIcon /> },
  { label: "Export Center", path: "/export", icon: <DownloadIcon /> },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    helixApi
      .getHealth()
      .then(setHealth)
      .catch((err) => console.warn("Failed to load health info:", err));
  }, []);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const currentDrawerWidth = isMobile ? DRAWER_WIDTH : collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0F172A",
        color: "#F8FAFC",
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: collapsed && !isMobile ? 1.5 : 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <Box
            component="img"
            src="/favicon.svg"
            alt="Helix AI"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(13, 148, 136, 0.4)",
              flexShrink: 0,
            }}
          />
          {(!collapsed || isMobile) && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                  lineHeight: 1.1,
                }}
              >
                Helix AI
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94A3B8",
                  fontSize: "0.68rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Intelligence Agent
              </Typography>
            </Box>
          )}
        </Box>

        {!isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            size="small"
            sx={{
              color: "#94A3B8",
              display: collapsed ? "none" : "flex",
              "&:hover": { color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.06)" },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 1.25, py: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip
                title={collapsed && !isMobile ? item.label : ""}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: collapsed && !isMobile ? 1.5 : 1.75,
                    justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                    backgroundColor: active ? "rgba(13, 148, 136, 0.15)" : "transparent",
                    color: active ? "#2DD4BF" : "#94A3B8",
                    border: active ? "1px solid rgba(45, 212, 191, 0.25)" : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: active
                        ? "rgba(13, 148, 136, 0.22)"
                        : "rgba(255, 255, 255, 0.05)",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed && !isMobile ? "auto" : 34,
                      color: active ? "#2DD4BF" : "#64748B",
                      "& svg": { fontSize: "1.2rem" },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontSize: "0.835rem",
                            fontWeight: active ? 700 : 500,
                            color: active ? "#FFFFFF" : "#CBD5E1",
                          }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Sidebar Footer */}
      <Box
        sx={{
          p: collapsed && !isMobile ? 1 : 2,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#0B1120",
        }}
      >
        {collapsed && !isMobile ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <IconButton
              onClick={handleDrawerToggle}
              size="small"
              sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                VERSION 1.0.0
              </Typography>
              <Chip
                label="Production"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  backgroundColor: "rgba(13, 148, 136, 0.2)",
                  color: "#2DD4BF",
                  border: "1px solid rgba(45, 212, 191, 0.3)",
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#475569", fontSize: "0.7rem", display: "block" }}>
              Scientific Pipeline Bridge
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <CssBaseline />

      {/* Top Application Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          color: "#0F172A",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 3 }, minHeight: 64 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "#1E293B",
                display: { xs: "none", sm: "block" },
              }}
            >
              Scientific Research Workspace
            </Typography>
          </Box>

          {/* Runtime Credentials & Badges */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {/* OpenAI Key Status */}
            <Tooltip title={health?.has_openai_key ? "OpenAI API Key configured and active" : "OpenAI API Key missing — configure in .env"}>
              <Chip
                icon={<KeyIcon style={{ fontSize: 13 }} />}
                label={health?.has_openai_key ? "OpenAI Active" : "No OpenAI Key"}
                size="small"
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  backgroundColor: health?.has_openai_key ? "#DCFCE7" : "#FEF9C3",
                  color: health?.has_openai_key ? "#166534" : "#854D0E",
                  border: `1px solid ${health?.has_openai_key ? "#86EFAC" : "#FDE047"}`,
                }}
              />
            </Tooltip>

            {/* NCBI Rate Limit */}
            <Tooltip title={health?.has_ncbi_key ? "NCBI Key present: 10 requests/sec allowed" : "Standard NCBI rate limit: 3 requests/sec"}>
              <Chip
                icon={<SpeedIcon style={{ fontSize: 13 }} />}
                label={health?.has_ncbi_key ? "NCBI: 10 req/s" : "NCBI: 3 req/s"}
                size="small"
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  backgroundColor: "#F1F5F9",
                  color: "#334155",
                  border: "1px solid #CBD5E1",
                }}
              />
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: currentDrawerWidth,
              borderRight: "1px solid rgba(255, 255, 255, 0.08)",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Viewport */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 3.5 },
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#F8FAFC",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppShell;
