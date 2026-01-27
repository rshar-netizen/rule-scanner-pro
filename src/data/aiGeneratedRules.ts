import { AIGeneratedRule } from '@/components/AIGeneratedRulesTable';

// AI-Generated rules based on sample data analysis
export const AI_GENERATED_RULES: AIGeneratedRule[] = [
  {
    id: 'AI_L1',
    tableName: 'lease_master',
    ruleId: 'AI_L1_LEASE_ID_NOT_NULL',
    codeSnippet: `# AI Generated: Lease ID Not Null Check
# Detected: Column 'lease_id' contains empty values that could break FK relationships
bad_rows = df["lease_id"].isna() | (df["lease_id"].astype(str).str.strip() == "")
dq.log("AI_L1_LEASE_ID_NOT_NULL", table, "ERROR", "rows_failed", int(bad_rows.sum()), "drop_rows")
df = df.loc[~bad_rows].copy()`,
    ruleDescription: 'lease_id must be present (non-null, non-empty) - Detected empty values in sample data',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'fail',
      rowsAffected: 1,
      message: '1 row failed validation (row 3 has empty lease_id)'
    }
  },
  {
    id: 'AI_L2',
    tableName: 'lease_master',
    ruleId: 'AI_L2_PROPERTY_ID_NOT_NULL',
    codeSnippet: `# AI Generated: Property ID Not Null Check
# Detected: Column 'property_id' contains NULL values affecting referential integrity
bad_rows = df["property_id"].isna() | (df["property_id"].astype(str).str.strip() == "")
dq.log("AI_L2_PROPERTY_ID_NOT_NULL", table, "ERROR", "rows_failed", int(bad_rows.sum()), "drop_rows")
df = df.loc[~bad_rows].copy()`,
    ruleDescription: 'property_id must be present - NULL value detected in sample data row 4',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'fail',
      rowsAffected: 1,
      message: '1 row failed validation (row 4 has NULL property_id)'
    }
  },
  {
    id: 'AI_L3',
    tableName: 'lease_master',
    ruleId: 'AI_L3_TENANT_ID_NOT_EMPTY',
    codeSnippet: `# AI Generated: Tenant ID Not Empty Check
# Detected: Column 'tenant_id' contains empty string values
bad_rows = df["tenant_id"].isna() | (df["tenant_id"].astype(str).str.strip() == "")
dq.log("AI_L3_TENANT_ID_NOT_EMPTY", table, "WARN", "rows_failed", int(bad_rows.sum()), "flag_only")`,
    ruleDescription: 'tenant_id should not be empty - Empty string detected in sample data row 5',
    severity: 'WARN',
    actionTaken: 'Flag only',
    result: {
      status: 'warning',
      rowsAffected: 1,
      message: '1 row flagged (row 5 has empty tenant_id)'
    }
  },
  {
    id: 'AI_L4',
    tableName: 'lease_master',
    ruleId: 'AI_L4_RENT_POSITIVE',
    codeSnippet: `# AI Generated: Monthly Rent Positive Value Check
# Detected: Column 'monthly_rent' contains negative value (-500) which is invalid for rent
bad_rows = pd.to_numeric(df["monthly_rent"], errors="coerce") <= 0
dq.log("AI_L4_RENT_POSITIVE", table, "ERROR", "rows_failed", int(bad_rows.sum()), "drop_rows")
df = df.loc[~bad_rows].copy()`,
    ruleDescription: 'monthly_rent must be positive - Negative value (-500) found in sample data',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'fail',
      rowsAffected: 1,
      message: '1 row failed validation (row 3 has -500 rent)'
    }
  },
  {
    id: 'AI_L5',
    tableName: 'lease_master',
    ruleId: 'AI_L5_DATE_RANGE_VALID',
    codeSnippet: `# AI Generated: Date Range Consistency Check
# Detected: Row with end_date (2024-02-28) before start_date (2024-03-01)
start = pd.to_datetime(df["start_date"], errors="coerce")
end = pd.to_datetime(df["end_date"], errors="coerce")
bad_rows = start > end
dq.log("AI_L5_DATE_RANGE_VALID", table, "ERROR", "rows_failed", int(bad_rows.sum()), "drop_rows")
df = df.loc[~bad_rows].copy()`,
    ruleDescription: 'end_date must be on or after start_date - Found inverted date range in row 3',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'fail',
      rowsAffected: 1,
      message: '1 row failed validation (row 3 has end < start)'
    }
  },
  {
    id: 'AI_L6',
    tableName: 'lease_master',
    ruleId: 'AI_L6_START_DATE_NOT_NULL',
    codeSnippet: `# AI Generated: Start Date Not Null Check
# Detected: Column 'start_date' contains NULL value affecting lease period calculations
bad_rows = pd.to_datetime(df["start_date"], errors="coerce").isna()
dq.log("AI_L6_START_DATE_NOT_NULL", table, "ERROR", "rows_failed", int(bad_rows.sum()), "drop_rows")
df = df.loc[~bad_rows].copy()`,
    ruleDescription: 'start_date must be present and valid - NULL value detected in row 7',
    severity: 'ERROR',
    actionTaken: 'Drop failing rows',
    result: {
      status: 'fail',
      rowsAffected: 1,
      message: '1 row failed validation (row 7 has NULL start_date)'
    }
  },
  {
    id: 'AI_L7',
    tableName: 'lease_master',
    ruleId: 'AI_L7_STATUS_ALLOWED',
    codeSnippet: `# AI Generated: Status Allowed Values Check
# Detected: Column 'status' contains value 'InvalidStatus' not in allowed set
allowed_status = {"Active", "Pending", "Expired", "Terminated", "Renewed"}
bad_rows = ~df["status"].isin(allowed_status)
dq.log("AI_L7_STATUS_ALLOWED", table, "WARN", "rows_failed", int(bad_rows.sum()), "set_unknown")
df.loc[bad_rows, "status"] = "Unknown"`,
    ruleDescription: 'status must be one of Active/Pending/Expired/Terminated/Renewed - Invalid status found',
    severity: 'WARN',
    actionTaken: "Set to 'Unknown'",
    result: {
      status: 'warning',
      rowsAffected: 1,
      message: "1 row set to 'Unknown' (row 8 had 'InvalidStatus')"
    }
  },
  {
    id: 'AI_L8',
    tableName: 'lease_master',
    ruleId: 'AI_L8_PROPERTY_ID_FORMAT',
    codeSnippet: `# AI Generated: Property ID Format Validation
# Pattern detected: 'PRP' prefix followed by 6 digits (e.g., PRP000101)
bad_fmt = ~df["property_id"].astype(str).str.match(r"^PRP\\d{6}$")
dq.log("AI_L8_PROPERTY_ID_FORMAT", table, "WARN", "rows_failed", int(bad_fmt.sum()), "flag_only")`,
    ruleDescription: 'property_id should match pattern ^PRP\\d{6}$ based on detected format',
    severity: 'WARN',
    actionTaken: 'Flag only',
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All property_id values match expected format'
    }
  },
  {
    id: 'AI_L9',
    tableName: 'lease_master',
    ruleId: 'AI_L9_LEASE_ID_FORMAT',
    codeSnippet: `# AI Generated: Lease ID Format Validation
# Pattern detected: 'LSE' prefix followed by 3 digits (e.g., LSE001)
bad_fmt = ~df["lease_id"].astype(str).str.match(r"^LSE\\d{3}$")
dq.log("AI_L9_LEASE_ID_FORMAT", table, "INFO", "rows_failed", int(bad_fmt.sum()), "log_only")`,
    ruleDescription: 'lease_id should match pattern ^LSE\\d{3}$ based on detected format',
    severity: 'INFO',
    actionTaken: 'Log only',
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All lease_id values match expected format'
    }
  },
  {
    id: 'AI_L10',
    tableName: 'lease_master',
    ruleId: 'AI_L10_RENT_RANGE',
    codeSnippet: `# AI Generated: Monthly Rent Statistical Range Check
# Detected rent range: 5500 to 15000 in valid records
# Values outside 2x this range may indicate data entry errors
rent = pd.to_numeric(df["monthly_rent"], errors="coerce")
bad_rows = (rent < 1000) | (rent > 50000)
dq.log("AI_L10_RENT_RANGE", table, "INFO", "rows_flagged", int(bad_rows.sum()), "flag_review")`,
    ruleDescription: 'monthly_rent expected range 1000-50000 based on statistical analysis',
    severity: 'INFO',
    actionTaken: 'Flag for review',
    result: {
      status: 'pass',
      rowsAffected: 0,
      message: 'All rent values within expected range'
    }
  }
];

// Summary statistics for AI-generated rules
export const getAIRuleSummary = () => {
  const total = AI_GENERATED_RULES.length;
  const passed = AI_GENERATED_RULES.filter(r => r.result.status === 'pass').length;
  const failed = AI_GENERATED_RULES.filter(r => r.result.status === 'fail').length;
  const warnings = AI_GENERATED_RULES.filter(r => r.result.status === 'warning').length;
  
  return {
    total,
    passed,
    failed,
    warnings,
    passRate: ((passed / total) * 100).toFixed(1)
  };
};
