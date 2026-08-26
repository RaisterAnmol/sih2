import { describe, it, expect } from 'vitest';
import { FallbackRuleEngine } from '../src/services/fallbackEngine.js';

describe('FallbackRuleEngine & Statistical Scoring', () => {
  it('should detect cost outliers when project cost deviates > 2.2x peer median', () => {
    const mockProjects = [
      {
        projectId: 'P1',
        title: 'Community Hall Ward 1',
        category: 'Community Assets',
        district: 'Pune',
        allocatedAmount: 2000000,
        utilizedAmount: 1800000,
        contractorName: 'Vendor A',
      },
      {
        projectId: 'P2',
        title: 'Community Hall Ward 2',
        category: 'Community Assets',
        district: 'Pune',
        allocatedAmount: 2200000,
        utilizedAmount: 2000000,
        contractorName: 'Vendor B',
      },
      {
        projectId: 'P3',
        title: 'Community Hall Ward 3 Outlier',
        category: 'Community Assets',
        district: 'Pune',
        allocatedAmount: 8500000, // ~4x median
        utilizedAmount: 4000000,
        contractorName: 'Vendor C',
      },
    ];

    const results = FallbackRuleEngine.analyzeProjects(mockProjects);
    expect(results).toHaveLength(3);

    const outlier = results.find((r) => r.projectId === 'P3');
    expect(outlier).toBeDefined();
    expect(outlier?.overallRiskScore).toBeGreaterThan(50);
    expect(outlier?.signals.some((s) => s.ruleId === 'RULE_FIN_COST_OUTLIER')).toBe(true);
  });

  it('should detect contractor monopoly concentration', () => {
    const mockProjects = Array.from({ length: 10 }, (_, i) => ({
      projectId: `P-${i}`,
      title: `Road Construction Sector ${i}`,
      category: 'Roads',
      district: 'Nagpur',
      allocatedAmount: 1500000,
      contractorName: i < 5 ? 'Monopoly Builders' : `Vendor ${i}`, // 50% share
    }));

    const results = FallbackRuleEngine.analyzeProjects(mockProjects);
    const flagged = results.filter((r) => r.signals.some((s) => s.ruleId === 'RULE_CONT_MONOPOLY_SHARE'));
    expect(flagged.length).toBeGreaterThanOrEqual(5);
  });
});
