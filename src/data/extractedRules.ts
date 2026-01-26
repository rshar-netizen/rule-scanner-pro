// Extracted DQ rules from PGIM Real Estate Silver->Gold Pipeline

export interface ExtractedRule {
  id: string;
  tableName: string;
  ruleId: string;
  codeSnippet: string;
  ruleDescription: string;
  severity: 'ERROR' | 'WARN' | 'INFO';
  actionTaken: string;
  result: {
    status: 'pass' | 'fail' | 'warning';
    rowsAffected: number;
    message: string;
  };
}

export interface LogEntry {
  timestamp: string;
  runId: string;
  table: string;
  rule: string;
  severity: string;
  metricName: string;
  metricValue: number;
  action: string;
}

// Rules extracted from re_silver_to_gold_pipeline.py with results from dq_run_log.txt
export const extractedPropertyRules: ExtractedRule[] = [
  {
    id: 'P1',
    tableName: 'property_master',
    ruleId: 'P1_ID_NOT_NULL',
    codeSnippet: `# P1: property_id not null -> drop
missing_id = df["property_id"].isna() | (df["property_id"].astype(str).str.strip() == "")
dq.log("P1_ID_NOT_NULL", table, "ERROR", "rows_failed", int(missing_id.sum()), "drop_rows")
df = df.loc[~missing_id].copy()`,
    ruleDescription: 'property_id must be present (non-null, non-empty)',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'fail',
      rowsAffected: 1,
      message: '1 row failed validation and was dropped'
    }
  },
  {
    id: 'P2',
    tableName: 'property_master',
    ruleId: 'P2_ID_FORMAT',
    codeSnippet: `# P2: property_id format -> normalize then drop invalid
df["property_id"] = df["property_id"].apply(normalize_prp)
bad_fmt = ~df["property_id"].astype(str).str.match(r"^PRP\\d{6}$")
dq.log("P2_ID_FORMAT", table, "ERROR", "rows_failed", int(bad_fmt.sum()), "drop_rows")
df = df.loc[~bad_fmt].copy()`,
    ruleDescription: 'property_id must match ^PRP\\d{6}$ after normalization',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All rows passed validation'
    }
  },
  {
    id: 'P3',
    tableName: 'property_master',
    ruleId: 'P3_YEAR_BUILT_RANGE',
    codeSnippet: `# P3: year_built range -> set null
current_year = datetime.now().year
year = pd.to_numeric(df.get("year_built"), errors="coerce")
bad_year = (year < 1800) | (year > current_year)
dq.log("P3_YEAR_BUILT_RANGE", table, "WARN", "rows_failed", int(bad_year.sum()), "set_null")
df.loc[bad_year, "year_built"] = pd.NA`,
    ruleDescription: 'year_built must be between 1800 and current year',
    severity: 'WARN',
    actionTaken: 'Set invalid values to NULL',
    result: {
      status: 'warning',
      rowsAffected: 1,
      message: '1 row had invalid year_built, set to NULL'
    }
  },
  {
    id: 'P4',
    tableName: 'property_master',
    ruleId: 'P4_GROSS_AREA_POSITIVE',
    codeSnippet: `# P4: gross_area_sqft > 0 -> drop
area = pd.to_numeric(df.get("gross_area_sqft"), errors="coerce")
bad_area = area.isna() | (area <= 0)
dq.log("P4_GROSS_AREA_POSITIVE", table, "ERROR", "rows_failed", int(bad_area.sum()), "drop_rows")
df = df.loc[~bad_area].copy()`,
    ruleDescription: 'gross_area_sqft must be > 0',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'fail',
      rowsAffected: 1,
      message: '1 row failed validation and was dropped'
    }
  },
  {
    id: 'P5',
    tableName: 'property_master',
    ruleId: 'P5_OCCUPANCY_CLAMP',
    codeSnippet: `# P5: occupancy clamp 0..100 -> clamp
occ = pd.to_numeric(df.get("occupancy_rate_pct"), errors="coerce")
bad_occ = occ.isna() | (occ < 0) | (occ > 100)
dq.log("P5_OCCUPANCY_CLAMP", table, "WARN", "rows_failed", int(bad_occ.sum()), "clamp_0_100")
df["occupancy_rate_pct"] = occ.clip(lower=0, upper=100)`,
    ruleDescription: 'occupancy_rate_pct must be within 0..100',
    severity: 'WARN',
    actionTaken: 'Clamp to 0..100',
    result: {
      status: 'warning',
      rowsAffected: 5,
      message: '5 rows had values clamped to 0-100 range'
    }
  },
  {
    id: 'P6',
    tableName: 'property_master',
    ruleId: 'P6_PROPERTY_TYPE_MAP',
    codeSnippet: `# P6: property_type map -> Unknown if unmapped
unmapped = (~df.get("property_type", pd.Series(dtype=str)).isin(PROPERTY_TYPE_MAP.keys())).sum()
dq.log("P6_PROPERTY_TYPE_MAP", table, "WARN", "rows_failed", int(unmapped), "map_or_unknown")
df["property_type"] = df["property_type"].map(PROPERTY_TYPE_MAP).fillna("Unknown")`,
    ruleDescription: 'property_type must map to controlled vocabulary',
    severity: 'WARN',
    actionTaken: "Map; else set to 'Unknown'",
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All property types mapped successfully'
    }
  },
  {
    id: 'P7',
    tableName: 'property_master',
    ruleId: 'P7_COUNTRY_STANDARDIZE',
    codeSnippet: `# P7: country standardize -> Unknown if unexpected
country = df.get("country", pd.Series(dtype=str)).replace(COUNTRY_MAP)
bad_country = ~country.isin(["Canada", "United States"])
dq.log("P7_COUNTRY_STANDARDIZE", table, "WARN", "rows_failed", int(bad_country.sum()), "set_unknown")
df["country"] = country.where(~bad_country, "Unknown")`,
    ruleDescription: 'country must be Canada or United States',
    severity: 'WARN',
    actionTaken: "Standardize; else set 'Unknown'",
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All countries standardized successfully'
    }
  },
  {
    id: 'P8',
    tableName: 'property_master',
    ruleId: 'P8_STATE_STANDARDIZE',
    codeSnippet: `# P8: state/province standardize -> 'UN' if still not 2-letter
state = df.get("state_province", pd.Series(dtype=str)).replace(STATE_MAP)
bad_state = state.astype(str).str.len().gt(2)
dq.log("P8_STATE_STANDARDIZE", table, "WARN", "rows_failed", int(bad_state.sum()), "set_UN")
df["state_province"] = state.where(~bad_state, "UN")`,
    ruleDescription: 'state_province should be a 2-letter code',
    severity: 'WARN',
    actionTaken: "Map known; else set 'UN'",
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All states standardized successfully'
    }
  },
  {
    id: 'P9',
    tableName: 'property_master',
    ruleId: 'P9_UPDATED_AT_PARSE',
    codeSnippet: `# P9: updated_at parse fallback to created_at or epoch
upd = pd.to_datetime(df.get("updated_at"), errors="coerce")
missing_upd = upd.isna().sum()
dq.log("P9_UPDATED_AT_PARSE", table, "WARN", "rows_failed", int(missing_upd), "fallback_created_at")
df["_updated_at_ts"] = upd.fillna(pd.to_datetime(df.get("created_at"), errors="coerce")).fillna(pd.Timestamp("1970-01-01"))`,
    ruleDescription: 'updated_at must parse as date',
    severity: 'WARN',
    actionTaken: 'Fallback to created_at or epoch',
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All timestamps parsed successfully'
    }
  },
  {
    id: 'P10',
    tableName: 'property_master',
    ruleId: 'P10_DEDUPE_SURVIVORSHIP',
    codeSnippet: `# P10: dedupe by property_id keep latest updated_at
df = df.sort_values(["property_id", "_updated_at_ts"], ascending=[True, False])
dupes = df.duplicated(subset=["property_id"], keep="first").sum()
dq.log("P10_DEDUPE_SURVIVORSHIP", table, "INFO", "rows_deduped", int(dupes), "keep_latest")
df = df.drop_duplicates(subset=["property_id"], keep="first").copy()`,
    ruleDescription: 'property_id must be unique in gold',
    severity: 'INFO',
    actionTaken: 'Keep latest by updated_at',
    result: {
      status: 'pass',
      rowsAffected: 1,
      message: '1 duplicate row removed, kept latest record'
    }
  }
];

export const extractedTenantRules: ExtractedRule[] = [
  {
    id: 'T1',
    tableName: 'tenant_master',
    ruleId: 'T1_ID_NOT_NULL',
    codeSnippet: `# T1: tenant_id not null -> drop
missing_id = df["tenant_id"].isna() | (df["tenant_id"].astype(str).str.strip() == "")
dq.log("T1_ID_NOT_NULL", table, "ERROR", "rows_failed", int(missing_id.sum()), "drop_rows")
df = df.loc[~missing_id].copy()`,
    ruleDescription: 'tenant_id must be present (non-null, non-empty)',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'fail',
      rowsAffected: 1,
      message: '1 row failed validation and was dropped'
    }
  },
  {
    id: 'T2',
    tableName: 'tenant_master',
    ruleId: 'T2_ID_FORMAT',
    codeSnippet: `# T2: tenant_id format -> normalize then drop invalid
df["tenant_id"] = df["tenant_id"].apply(normalize_tnt)
bad_fmt = ~df["tenant_id"].astype(str).str.match(r"^TNT\\d{6}$")
dq.log("T2_ID_FORMAT", table, "ERROR", "rows_failed", int(bad_fmt.sum()), "drop_rows")
df = df.loc[~bad_fmt].copy()`,
    ruleDescription: 'tenant_id must match ^TNT\\d{6}$ after normalization',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All rows passed validation'
    }
  },
  {
    id: 'T3',
    tableName: 'tenant_master',
    ruleId: 'T3_LEGAL_NAME_NOT_NULL',
    codeSnippet: `# T3: tenant_legal_name not null -> drop
bad_name = df["tenant_legal_name"].isna() | (df["tenant_legal_name"].astype(str).str.strip() == "")
dq.log("T3_LEGAL_NAME_NOT_NULL", table, "ERROR", "rows_failed", int(bad_name.sum()), "drop_rows")
df = df.loc[~bad_name].copy()`,
    ruleDescription: 'tenant_legal_name must be present',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All rows passed validation'
    }
  },
  {
    id: 'T4',
    tableName: 'tenant_master',
    ruleId: 'T4_INDUSTRY_MAP',
    codeSnippet: `# T4: industry map -> Unknown if unmapped
unmapped = (~df.get("industry", pd.Series(dtype=str)).isin(INDUSTRY_MAP.keys())).sum()
dq.log("T4_INDUSTRY_MAP", table, "WARN", "rows_failed", int(unmapped), "map_or_unknown")
df["industry"] = df["industry"].map(INDUSTRY_MAP).fillna("Unknown")`,
    ruleDescription: 'industry must map to controlled taxonomy',
    severity: 'WARN',
    actionTaken: "Map; else set to 'Unknown'",
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All industries mapped successfully'
    }
  },
  {
    id: 'T5',
    tableName: 'tenant_master',
    ruleId: 'T5_CREDIT_RATING_ALLOWED',
    codeSnippet: `# T5: credit rating allowed -> normalize; invalid -> NR
allowed = {"A", "BBB", "BB", "B", "NR"}
cr = df.get("credit_rating_internal", "").fillna("").astype(str).str.strip().str.upper()
invalid = ~cr.isin(allowed)
dq.log("T5_CREDIT_RATING_ALLOWED", table, "WARN", "rows_failed", int(invalid.sum()), "set_NR")
df["credit_rating_internal"] = cr.where(~invalid, "NR")`,
    ruleDescription: 'credit_rating_internal must be one of A/BBB/BB/B/NR',
    severity: 'WARN',
    actionTaken: 'Normalize; invalid -> NR',
    result: {
      status: 'warning',
      rowsAffected: 9,
      message: '9 rows had invalid credit ratings, set to NR'
    }
  },
  {
    id: 'T6',
    tableName: 'tenant_master',
    ruleId: 'T6_UPDATED_AT_PARSE',
    codeSnippet: `# T6: updated_at parse fallback to created_at or epoch
upd = pd.to_datetime(df.get("updated_at"), errors="coerce")
missing_upd = upd.isna().sum()
dq.log("T6_UPDATED_AT_PARSE", table, "WARN", "rows_failed", int(missing_upd), "fallback_created_at")
df["_updated_at_ts"] = upd.fillna(pd.to_datetime(df.get("created_at"), errors="coerce")).fillna(pd.Timestamp("1970-01-01"))`,
    ruleDescription: 'updated_at must parse as date',
    severity: 'WARN',
    actionTaken: 'Fallback to created_at or epoch',
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All timestamps parsed successfully'
    }
  },
  {
    id: 'T7',
    tableName: 'tenant_master',
    ruleId: 'T7_DEDUPE_SURVIVORSHIP',
    codeSnippet: `# T7: dedupe by tenant_id keep latest updated_at
df = df.sort_values(["tenant_id", "_updated_at_ts"], ascending=[True, False])
dupes = df.duplicated(subset=["tenant_id"], keep="first").sum()
dq.log("T7_DEDUPE_SURVIVORSHIP", table, "INFO", "rows_deduped", int(dupes), "keep_latest")
df = df.drop_duplicates(subset=["tenant_id"], keep="first").copy()`,
    ruleDescription: 'tenant_id must be unique in gold',
    severity: 'INFO',
    actionTaken: 'Keep latest by updated_at',
    result: {
      status: 'pass',
      rowsAffected: 1,
      message: '1 duplicate row removed, kept latest record'
    }
  }
];

export const allExtractedRules = [...extractedPropertyRules, ...extractedTenantRules];

// Summary statistics
export const getRuleSummary = () => {
  const total = allExtractedRules.length;
  const passed = allExtractedRules.filter(r => r.result.status === 'pass').length;
  const failed = allExtractedRules.filter(r => r.result.status === 'fail').length;
  const warnings = allExtractedRules.filter(r => r.result.status === 'warning').length;
  
  return {
    total,
    passed,
    failed,
    warnings,
    passRate: ((passed / total) * 100).toFixed(1)
  };
};
