export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  pipeline: string;
  status: 'passing' | 'failing' | 'warning';
  lastRun: string;
  passRate: number;
  codeSnippet: string;
  category: 'completeness' | 'validity' | 'uniqueness' | 'consistency' | 'timeliness';
}

export interface RuntimeLog {
  id: string;
  timestamp: string;
  ruleId: string;
  ruleName: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  recordsChecked: number;
  recordsFailed: number;
  duration: number;
}

export interface Pipeline {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  rulesCount: number;
  lastRun: string;
  passRate: number;
}

export const mockRules: DataQualityRule[] = [
  {
    id: 'rule-001',
    name: 'email_format_validation',
    description: 'Validates that email fields match RFC 5322 format',
    severity: 'critical',
    source: 'customer_ingestion.py:45',
    pipeline: 'Customer Data Pipeline',
    status: 'passing',
    lastRun: '2 mins ago',
    passRate: 99.8,
    codeSnippet: `if not re.match(r'^[\\w.-]+@[\\w.-]+\\.\\w+$', email):
    raise ValidationError("Invalid email format")`,
    category: 'validity'
  },
  {
    id: 'rule-002',
    name: 'null_check_required_fields',
    description: 'Ensures required fields (user_id, created_at) are never null',
    severity: 'critical',
    source: 'user_transform.py:78',
    pipeline: 'User Events Pipeline',
    status: 'failing',
    lastRun: '5 mins ago',
    passRate: 94.2,
    codeSnippet: `assert df['user_id'].notna().all(), "user_id cannot be null"
assert df['created_at'].notna().all(), "created_at cannot be null"`,
    category: 'completeness'
  },
  {
    id: 'rule-003',
    name: 'unique_transaction_id',
    description: 'Validates transaction IDs are unique within each batch',
    severity: 'high',
    source: 'transactions_loader.py:122',
    pipeline: 'Financial Transactions',
    status: 'passing',
    lastRun: '1 min ago',
    passRate: 100,
    codeSnippet: `if df['transaction_id'].duplicated().any():
    duplicates = df[df['transaction_id'].duplicated()]
    raise DuplicateKeyError(f"Found {len(duplicates)} duplicates")`,
    category: 'uniqueness'
  },
  {
    id: 'rule-004',
    name: 'date_range_validation',
    description: 'Ensures dates are within acceptable range (not future, not too old)',
    severity: 'medium',
    source: 'orders_validator.py:56',
    pipeline: 'Orders Pipeline',
    status: 'warning',
    lastRun: '8 mins ago',
    passRate: 97.5,
    codeSnippet: `max_date = datetime.now()
min_date = datetime.now() - timedelta(days=365*2)
assert min_date <= order_date <= max_date`,
    category: 'validity'
  },
  {
    id: 'rule-005',
    name: 'referential_integrity_check',
    description: 'Validates foreign key references exist in parent tables',
    severity: 'high',
    source: 'product_sync.py:89',
    pipeline: 'Product Catalog',
    status: 'passing',
    lastRun: '3 mins ago',
    passRate: 99.1,
    codeSnippet: `missing_refs = set(df['category_id']) - set(categories['id'])
if missing_refs:
    raise IntegrityError(f"Missing category refs: {missing_refs}")`,
    category: 'consistency'
  },
  {
    id: 'rule-006',
    name: 'freshness_sla_check',
    description: 'Ensures data arrives within 15-minute SLA window',
    severity: 'high',
    source: 'streaming_validator.py:34',
    pipeline: 'Real-time Events',
    status: 'failing',
    lastRun: '12 mins ago',
    passRate: 88.3,
    codeSnippet: `latency = datetime.now() - event_timestamp
if latency > timedelta(minutes=15):
    alert.trigger("SLA breach detected")`,
    category: 'timeliness'
  },
  {
    id: 'rule-007',
    name: 'numeric_range_validation',
    description: 'Validates price values are positive and within expected range',
    severity: 'medium',
    source: 'pricing_etl.py:67',
    pipeline: 'Pricing Updates',
    status: 'passing',
    lastRun: '6 mins ago',
    passRate: 99.9,
    codeSnippet: `assert df['price'].between(0.01, 999999.99).all(),
    "Price must be between $0.01 and $999,999.99"`,
    category: 'validity'
  },
  {
    id: 'rule-008',
    name: 'schema_compliance_check',
    description: 'Validates incoming data matches expected schema version',
    severity: 'critical',
    source: 'schema_validator.py:23',
    pipeline: 'API Ingestion',
    status: 'passing',
    lastRun: '1 min ago',
    passRate: 100,
    codeSnippet: `schema = load_schema('v2.3.1')
validate(instance=data, schema=schema)`,
    category: 'consistency'
  }
];

export const mockLogs: RuntimeLog[] = [
  {
    id: 'log-001',
    timestamp: '2024-01-15T14:32:15Z',
    ruleId: 'rule-002',
    ruleName: 'null_check_required_fields',
    status: 'fail',
    message: 'Found 1,247 records with null user_id in batch #45892',
    recordsChecked: 50000,
    recordsFailed: 1247,
    duration: 234
  },
  {
    id: 'log-002',
    timestamp: '2024-01-15T14:31:45Z',
    ruleId: 'rule-001',
    ruleName: 'email_format_validation',
    status: 'pass',
    message: 'All 25,000 email records validated successfully',
    recordsChecked: 25000,
    recordsFailed: 0,
    duration: 156
  },
  {
    id: 'log-003',
    timestamp: '2024-01-15T14:31:20Z',
    ruleId: 'rule-006',
    ruleName: 'freshness_sla_check',
    status: 'fail',
    message: 'SLA breach: 342 events arrived 18+ minutes late',
    recordsChecked: 15000,
    recordsFailed: 342,
    duration: 89
  },
  {
    id: 'log-004',
    timestamp: '2024-01-15T14:30:55Z',
    ruleId: 'rule-004',
    ruleName: 'date_range_validation',
    status: 'warning',
    message: '125 orders have dates older than 18 months',
    recordsChecked: 5000,
    recordsFailed: 125,
    duration: 45
  },
  {
    id: 'log-005',
    timestamp: '2024-01-15T14:30:30Z',
    ruleId: 'rule-003',
    ruleName: 'unique_transaction_id',
    status: 'pass',
    message: 'All 75,000 transaction IDs verified unique',
    recordsChecked: 75000,
    recordsFailed: 0,
    duration: 312
  },
  {
    id: 'log-006',
    timestamp: '2024-01-15T14:30:00Z',
    ruleId: 'rule-005',
    ruleName: 'referential_integrity_check',
    status: 'pass',
    message: 'All category references validated',
    recordsChecked: 12000,
    recordsFailed: 0,
    duration: 178
  },
  {
    id: 'log-007',
    timestamp: '2024-01-15T14:29:30Z',
    ruleId: 'rule-008',
    ruleName: 'schema_compliance_check',
    status: 'pass',
    message: 'Schema v2.3.1 compliance verified for 8,500 records',
    recordsChecked: 8500,
    recordsFailed: 0,
    duration: 67
  },
  {
    id: 'log-008',
    timestamp: '2024-01-15T14:29:00Z',
    ruleId: 'rule-007',
    ruleName: 'numeric_range_validation',
    status: 'pass',
    message: 'Price range validation passed for 32,000 products',
    recordsChecked: 32000,
    recordsFailed: 0,
    duration: 203
  }
];

export const mockPipelines: Pipeline[] = [
  {
    id: 'pipe-001',
    name: 'Customer Data Pipeline',
    status: 'healthy',
    rulesCount: 12,
    lastRun: '2 mins ago',
    passRate: 99.2
  },
  {
    id: 'pipe-002',
    name: 'User Events Pipeline',
    status: 'critical',
    rulesCount: 8,
    lastRun: '5 mins ago',
    passRate: 94.2
  },
  {
    id: 'pipe-003',
    name: 'Financial Transactions',
    status: 'healthy',
    rulesCount: 15,
    lastRun: '1 min ago',
    passRate: 100
  },
  {
    id: 'pipe-004',
    name: 'Orders Pipeline',
    status: 'degraded',
    rulesCount: 10,
    lastRun: '8 mins ago',
    passRate: 97.5
  },
  {
    id: 'pipe-005',
    name: 'Real-time Events',
    status: 'critical',
    rulesCount: 6,
    lastRun: '12 mins ago',
    passRate: 88.3
  },
  {
    id: 'pipe-006',
    name: 'Product Catalog',
    status: 'healthy',
    rulesCount: 9,
    lastRun: '3 mins ago',
    passRate: 99.1
  }
];

export const mockCodeFiles = [
  'src/pipelines/customer_ingestion.py',
  'src/pipelines/user_transform.py',
  'src/pipelines/transactions_loader.py',
  'src/validators/orders_validator.py',
  'src/validators/product_sync.py',
  'src/validators/streaming_validator.py',
  'src/etl/pricing_etl.py',
  'src/validators/schema_validator.py',
  'src/utils/data_quality.py',
  'src/config/rules_config.yaml'
];
