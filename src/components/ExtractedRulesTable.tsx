import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExtractedRule, extractedPropertyRules, extractedTenantRules } from '@/data/extractedRules';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Info, Code } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const severityConfig = {
  ERROR: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
  WARN: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  INFO: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
};

const resultConfig = {
  pass: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Pass' },
  fail: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Fail' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: 'Warning' },
};

interface RuleTableProps {
  rules: ExtractedRule[];
}

function RuleTable({ rules }: RuleTableProps) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/30 hover:bg-transparent">
            <TableHead className="w-[140px]">Table Name</TableHead>
            <TableHead className="w-[160px]">Rule Extracted</TableHead>
            <TableHead className="w-[100px]">Code Snippet</TableHead>
            <TableHead className="min-w-[200px]">Rule Description</TableHead>
            <TableHead className="w-[140px]">Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => {
            const ResultIcon = resultConfig[rule.result.status].icon;
            const isExpanded = expandedCode === rule.id;
            
            return (
              <>
                <TableRow 
                  key={rule.id} 
                  className="border-border/20 hover:bg-muted/30"
                >
                  <TableCell className="font-mono text-xs">
                    <Badge variant="outline" className="font-mono">
                      {rule.tableName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={cn(
                          "text-xs",
                          severityConfig[rule.severity].bg,
                          severityConfig[rule.severity].color
                        )}
                      >
                        {rule.severity}
                      </Badge>
                      <span className="font-mono text-xs">{rule.ruleId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setExpandedCode(isExpanded ? null : rule.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                        "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Code className="w-3 h-3" />
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{rule.ruleDescription}</p>
                      <p className="text-xs text-muted-foreground">
                        Action: {rule.actionTaken}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md w-fit",
                        resultConfig[rule.result.status].bg
                      )}>
                        <ResultIcon className={cn("w-3.5 h-3.5", resultConfig[rule.result.status].color)} />
                        <span className={cn("text-xs font-medium", resultConfig[rule.result.status].color)}>
                          {resultConfig[rule.result.status].label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {rule.result.rowsAffected > 0 
                          ? `${rule.result.rowsAffected} rows affected` 
                          : 'No rows affected'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow key={`${rule.id}-code`} className="hover:bg-transparent">
                    <TableCell colSpan={5} className="p-0">
                      <div className="p-4 bg-muted/30 border-y border-border/20">
                        <pre className="text-xs font-mono text-muted-foreground overflow-x-auto p-4 bg-background/50 rounded-lg border border-border/30">
                          <code>{rule.codeSnippet}</code>
                        </pre>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

interface TableSectionProps {
  tableName: string;
  rules: ExtractedRule[];
  defaultOpen?: boolean;
}

function TableSection({ tableName, rules, defaultOpen = false }: TableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const passCount = rules.filter(r => r.result.status === 'pass').length;
  const failCount = rules.filter(r => r.result.status === 'fail').length;
  const warnCount = rules.filter(r => r.result.status === 'warning').length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg transition-colors",
          "bg-muted/30 hover:bg-muted/50 border border-border/30"
        )}>
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold">{tableName}</span>
              <Badge variant="secondary" className="text-xs">
                {rules.length} rules
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {passCount > 0 && (
              <Badge className="bg-success/10 text-success text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {passCount} pass
              </Badge>
            )}
            {warnCount > 0 && (
              <Badge className="bg-warning/10 text-warning text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {warnCount} warn
              </Badge>
            )}
            {failCount > 0 && (
              <Badge className="bg-destructive/10 text-destructive text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                {failCount} fail
              </Badge>
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border border-border/30 overflow-hidden">
          <RuleTable rules={rules} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ExtractedRulesTable() {
  return (
    <div className="space-y-4">
      <TableSection 
        tableName="property_master" 
        rules={extractedPropertyRules} 
        defaultOpen={true}
      />
      <TableSection 
        tableName="tenant_master" 
        rules={extractedTenantRules} 
        defaultOpen={true}
      />
    </div>
  );
}
