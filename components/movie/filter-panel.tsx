"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Paper,
  IconButton,
  Fade,
  Chip,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  RestartAlt as ResetIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

interface FilterPanelProps {
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
}

const TYPE_LIST_OPTIONS = [
  { value: "all", label: "Tất Cả" },
  { value: "phim-bo", label: "Phim Bộ" },
  { value: "phim-le", label: "Phim Lẻ" },
  { value: "tv-shows", label: "TV Shows" },
  { value: "hoat-hinh", label: "Hoạt Hình" },
  { value: "phim-vietsub", label: "Phim Vietsub" },
  { value: "phim-thuyet-minh", label: "Phim Thuyết Minh" },
  { value: "phim-long-tieng", label: "Phim Lồng Tiếng" },
];

const SORT_FIELD_OPTIONS = [
  { value: "modified.time", label: "Thời gian cập nhật" },
  { value: "_id", label: "ID Phim" },
  { value: "year", label: "Năm phát hành" },
];

const SORT_TYPE_OPTIONS = [
  { value: "desc", label: "Giảm dần" },
  { value: "asc", label: "Tăng dần" },
];

const SORT_LANG_OPTIONS = [
  { value: "all", label: "Tất Cả" },
  { value: "vietsub", label: "Vietsub" },
  { value: "thuyet-minh", label: "Thuyết Minh" },
  { value: "long-tieng", label: "Lồng Tiếng" },
];

const LIMIT_OPTIONS = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "30", label: "30" },
  { value: "40", label: "40" },
  { value: "50", label: "50" },
  { value: "64", label: "64" },
];

const FilterPanel = ({ categories = [], countries = [] }: FilterPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    typeList: searchParams.get("typeList") || "",
    sortField: searchParams.get("sortField") || "modified.time",
    sortType: searchParams.get("sortType") || "",
    sortLang: searchParams.get("sortLang") || "",
    category: searchParams.get("category") || "",
    country: searchParams.get("country") || "",
    year: searchParams.get("year") || "",
    limit: searchParams.get("limit") || "20",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const YEAR_OPTIONS = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1970 + 1 }, (_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i),
    }));
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (key: string) => (event: SelectChangeEvent<string>) => {
    handleFilterChange(key, event.target.value);
  };

  const applyFilters = async () => {
    setIsOpen(false);
    const params = new URLSearchParams();
    params.set("typeList", filters.typeList);
    params.set("sortField", filters.sortField);
    params.set("sortType", filters.sortType);
    params.set("sortLang", filters.sortLang);
    if (filters.category) params.set("category", filters.category);
    if (filters.country) params.set("country", filters.country);
    if (filters.year) params.set("year", filters.year);
    params.set("limit", filters.limit);

    await router.push(`/?${params.toString()}`);
  };

  const resetFilters = async () => {
    setIsOpen(false);
    await router.push("/");
  };

  const hasActiveFilters =
    filters.typeList !== "phim-bo" ||
    filters.category ||
    filters.country ||
    filters.year ||
    filters.sortField !== "modified.time" ||
    filters.sortType !== "desc" ||
    filters.sortLang !== "vietsub" ||
    filters.limit !== "10";

  return (
    <Box sx={{ position: "relative" }}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={hasActiveFilters ? "contained" : "outlined"}
        color={hasActiveFilters ? "primary" : "inherit"}
        startIcon={<FilterIcon />}
        sx={{
          minWidth: "40px",
          px: { xs: 1, md: 2 },
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        <Box
          component="span"
          sx={{
            display: { xs: "none", md: "inline" },
            mr: hasActiveFilters ? 0.5 : 0
          }}
        >
          Lọc
        </Box>
        {hasActiveFilters && (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: "secondary.main",
              color: "secondary.contrastText",
              fontSize: "10px",
              fontWeight: "bold",
              ml: { xs: 0, md: 0.5 },
            }}
          >
            !
          </Box>
        )}
      </Button>

      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: { xs: "fixed", md: "absolute" },
            left: { xs: 16, md: "auto" },
            right: { xs: 16, md: 16 },
            top: { xs: 80, md: "100%" },
            width: { xs: "auto", md: 400 },
            maxWidth: { xs: "calc(100vw - 32px)", md: 400 },
            maxHeight: { xs: "calc(100vh - 120px)", md: "80vh" },
            overflow: "auto",
            zIndex: 1300,
            mt: { md: 1 },
            p: 3,
            borderRadius: 3,
            backdropFilter: "blur(10px)",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(18, 18, 18, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.12)"
              }`,
            transform: { md: "translateX(-100%)" },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #2196F3, #9C27B0)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Bộ Lọc Nâng Cao
            </Typography>
            <IconButton
              onClick={() => setIsOpen(false)}
              size="small"
              sx={{ 
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Type List */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Loại Phim</InputLabel>
              <Select
                value={filters.typeList}
                onChange={handleSelectChange("typeList")}
                label="Loại Phim"
              >
                {TYPE_LIST_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort Field */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sắp Xếp Theo</InputLabel>
              <Select
                value={filters.sortField}
                onChange={handleSelectChange("sortField")}
                label="Sắp Xếp Theo"
              >
                {SORT_FIELD_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort Type */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Kiểu Sắp Xếp</InputLabel>
              <Select
                value={filters.sortType}
                onChange={handleSelectChange("sortType")}
                label="Kiểu Sắp Xếp"
              >
                {SORT_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort Language */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Ngôn Ngữ</InputLabel>
              <Select
                value={filters.sortLang}
                onChange={handleSelectChange("sortLang")}
                label="Ngôn Ngữ"
              >
                {SORT_LANG_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Category */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Thể Loại</InputLabel>
              <Select
                value={filters.category || "all"}
                onChange={(e) =>
                  handleFilterChange("category", e.target.value === "all" ? "" : e.target.value)
                }
                label="Thể Loại"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Country */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Quốc Gia</InputLabel>
              <Select
                value={filters.country || "all"}
                onChange={(e) =>
                  handleFilterChange("country", e.target.value === "all" ? "" : e.target.value)
                }
                label="Quốc Gia"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.slug} value={country.slug}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Năm Phát Hành</InputLabel>
              <Select
                value={filters.year || "all"}
                onChange={(e) =>
                  handleFilterChange("year", e.target.value === "all" ? "" : e.target.value)
                }
                label="Năm Phát Hành"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {YEAR_OPTIONS.map((year) => (
                  <MenuItem key={year.value} value={year.value}>
                    {year.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Limit */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Số Lượng</InputLabel>
              <Select
                value={filters.limit}
                onChange={handleSelectChange("limit")}
                label="Số Lượng"
              >
                {LIMIT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              pt: 3,
              mt: 3,
              borderTop: (theme) =>
                `1px solid ${
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(0, 0, 0, 0.12)"
                }`,
            }}
          >
            <Button
              variant="outlined"
              onClick={resetFilters}
              disabled={isLoading}
              startIcon={<ResetIcon />}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Đặt Lại
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              disabled={isLoading}
              startIcon={<CheckIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                background: "linear-gradient(45deg, #2196F3, #9C27B0)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976D2, #7B1FA2)",
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {isLoading ? "Đang Tải..." : "Áp Dụng"}
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default memo(FilterPanel);
