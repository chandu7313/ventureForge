import { Injectable, Logger } from '@nestjs/common';

/**
 * FinancialCalculatorService — Deterministic Financial Engine.
 *
 * CRITICAL DESIGN DECISION: All financial calculations are performed here
 * using deterministic formulas — NOT by an LLM. The LLM (Gemini) is only
 * used to generate assumptions (growth rates, cost estimates) and to
 * explain the computed results in natural language.
 *
 * Supported calculations:
 * - Revenue projections (linear & compound growth)
 * - CAGR (Compound Annual Growth Rate)
 * - Break-even analysis
 * - ROI (Return on Investment)
 * - EBITDA
 * - Cash flow projections
 * - Burn rate & runway
 * - Unit economics (CAC, LTV, LTV/CAC ratio)
 * - DCF valuation
 * - ECharts configuration generation from computed data
 */

// ─── Result Interfaces ──────────────────────────────────────────

export interface YearlyProjection {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  growthRate: number;
}

export interface MonthlyProjection {
  month: number;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface BreakEvenResult {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  breakEvenMonths: number;
  monthlyFixedCosts: number;
  contributionMarginPerUnit: number;
}

export interface CashFlowProjection {
  month: number;
  label: string;
  inflow: number;
  outflow: number;
  netCash: number;
  cumulativeCash: number;
}

export interface UnitEconomicsResult {
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  paybackPeriodMonths: number;
  healthy: boolean;
  explanation: string;
}

export interface BurnRateResult {
  monthlyBurnRate: number;
  runwayMonths: number;
  cashBalance: number;
}

export interface FinancialAssumptions {
  initialMonthlyRevenue: number;
  monthlyRevenueGrowthRate: number; // e.g. 0.10 for 10% month-over-month
  monthlyFixedCosts: number;
  monthlyVariableCostRate: number; // as percentage of revenue e.g. 0.30
  initialInvestment: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
  cacPerCustomer: number;
  avgRevenuePerCustomer: number;
  avgCustomerLifetimeMonths: number;
  monthlyChurnRate: number; // e.g. 0.05 for 5%
  currencySymbol: string;
}

// ─── ECharts Types (simplified) ──────────────────────────────────

export interface EChartsOption {
  title?: { text: string; subtext?: string; left?: string };
  tooltip?: any;
  legend?: any;
  xAxis?: any;
  yAxis?: any;
  series?: any[];
  grid?: any;
  color?: string[];
  [key: string]: any;
}

@Injectable()
export class FinancialCalculatorService {
  private readonly logger = new Logger(FinancialCalculatorService.name);

  // ─── Core Financial Formulas ─────────────────────────────────

  /**
   * Compound Annual Growth Rate.
   * CAGR = (EndValue / StartValue)^(1/years) - 1
   */
  calculateCAGR(startValue: number, endValue: number, years: number): number {
    if (startValue <= 0 || years <= 0) return 0;
    return Math.pow(endValue / startValue, 1 / years) - 1;
  }

  /**
   * Return on Investment.
   * ROI = (Gain - Cost) / Cost × 100
   */
  calculateROI(gain: number, cost: number): number {
    if (cost === 0) return 0;
    return ((gain - cost) / cost) * 100;
  }

  /**
   * EBITDA — Earnings Before Interest, Taxes, Depreciation, and Amortization.
   */
  calculateEBITDA(
    revenue: number,
    operatingExpenses: number,
    depreciation: number = 0,
    amortization: number = 0,
  ): number {
    return revenue - operatingExpenses + depreciation + amortization;
  }

  // ─── Revenue Projections ─────────────────────────────────────

  /**
   * Generate 3-year monthly revenue projections using compound growth.
   */
  calculateMonthlyProjections(assumptions: FinancialAssumptions): MonthlyProjection[] {
    const projections: MonthlyProjection[] = [];

    for (let month = 1; month <= 36; month++) {
      const revenue =
        assumptions.initialMonthlyRevenue *
        Math.pow(1 + assumptions.monthlyRevenueGrowthRate, month - 1);
      const variableCosts = revenue * assumptions.monthlyVariableCostRate;
      const totalExpenses = assumptions.monthlyFixedCosts + variableCosts;
      const profit = revenue - totalExpenses;

      projections.push({
        month,
        label: `Month ${month}`,
        revenue: Math.round(revenue),
        expenses: Math.round(totalExpenses),
        profit: Math.round(profit),
      });
    }

    return projections;
  }

  /**
   * Generate 3-year annual projections (conservative, realistic, optimistic).
   */
  calculateYearlyProjections(
    assumptions: FinancialAssumptions,
  ): { conservative: YearlyProjection[]; realistic: YearlyProjection[]; optimistic: YearlyProjection[] } {
    const scenarios = {
      conservative: 0.6,  // 60% of assumed growth
      realistic: 1.0,     // 100% of assumed growth
      optimistic: 1.5,    // 150% of assumed growth
    };

    const generateScenario = (growthMultiplier: number): YearlyProjection[] => {
      const result: YearlyProjection[] = [];
      let annualRevenue = assumptions.initialMonthlyRevenue * 12;

      for (let year = 1; year <= 3; year++) {
        const effectiveGrowthRate =
          Math.pow(1 + assumptions.monthlyRevenueGrowthRate * growthMultiplier, 12) - 1;
        if (year > 1) {
          annualRevenue *= 1 + effectiveGrowthRate;
        }
        const annualExpenses =
          assumptions.monthlyFixedCosts * 12 +
          annualRevenue * assumptions.monthlyVariableCostRate;

        result.push({
          year,
          revenue: Math.round(annualRevenue),
          expenses: Math.round(annualExpenses),
          profit: Math.round(annualRevenue - annualExpenses),
          growthRate: year === 1 ? 0 : effectiveGrowthRate,
        });
      }

      return result;
    };

    return {
      conservative: generateScenario(scenarios.conservative),
      realistic: generateScenario(scenarios.realistic),
      optimistic: generateScenario(scenarios.optimistic),
    };
  }

  // ─── Break-Even Analysis ─────────────────────────────────────

  /**
   * Calculate break-even point in units, revenue, and months.
   */
  calculateBreakEven(assumptions: FinancialAssumptions): BreakEvenResult {
    const contributionMarginPerUnit =
      assumptions.pricePerUnit - assumptions.variableCostPerUnit;

    if (contributionMarginPerUnit <= 0) {
      return {
        breakEvenUnits: Infinity,
        breakEvenRevenue: Infinity,
        breakEvenMonths: Infinity,
        monthlyFixedCosts: assumptions.monthlyFixedCosts,
        contributionMarginPerUnit: 0,
      };
    }

    const breakEvenUnits = Math.ceil(
      assumptions.monthlyFixedCosts / contributionMarginPerUnit,
    );
    const breakEvenRevenue = breakEvenUnits * assumptions.pricePerUnit;

    // Estimate months to break even based on revenue growth trajectory
    let cumulativeProfit = -assumptions.initialInvestment;
    let months = 0;
    let monthlyRev = assumptions.initialMonthlyRevenue;
    while (cumulativeProfit < 0 && months < 120) {
      months++;
      monthlyRev *= 1 + assumptions.monthlyRevenueGrowthRate;
      const variableCosts = monthlyRev * assumptions.monthlyVariableCostRate;
      cumulativeProfit += monthlyRev - assumptions.monthlyFixedCosts - variableCosts;
    }

    return {
      breakEvenUnits,
      breakEvenRevenue: Math.round(breakEvenRevenue),
      breakEvenMonths: months,
      monthlyFixedCosts: assumptions.monthlyFixedCosts,
      contributionMarginPerUnit: Math.round(contributionMarginPerUnit * 100) / 100,
    };
  }

  // ─── Cash Flow ───────────────────────────────────────────────

  /**
   * Generate 12-month cash flow projections.
   */
  calculateCashFlow(assumptions: FinancialAssumptions): CashFlowProjection[] {
    const projections: CashFlowProjection[] = [];
    let cumulativeCash = assumptions.initialInvestment;

    for (let month = 1; month <= 12; month++) {
      const revenue =
        assumptions.initialMonthlyRevenue *
        Math.pow(1 + assumptions.monthlyRevenueGrowthRate, month - 1);
      const inflow = month === 1 ? revenue + assumptions.initialInvestment : revenue;
      const variableCosts = revenue * assumptions.monthlyVariableCostRate;
      const outflow = assumptions.monthlyFixedCosts + variableCosts;
      const netCash = inflow - outflow;
      cumulativeCash += netCash - (month === 1 ? assumptions.initialInvestment : 0);

      projections.push({
        month,
        label: `Month ${month}`,
        inflow: Math.round(inflow),
        outflow: Math.round(outflow),
        netCash: Math.round(netCash),
        cumulativeCash: Math.round(cumulativeCash),
      });
    }

    return projections;
  }

  // ─── Burn Rate & Runway ──────────────────────────────────────

  /**
   * Calculate monthly burn rate and runway.
   */
  calculateBurnRate(cashBalance: number, monthlyExpenses: number, monthlyRevenue: number): BurnRateResult {
    const monthlyBurnRate = monthlyExpenses - monthlyRevenue;
    const runwayMonths = monthlyBurnRate > 0 ? Math.floor(cashBalance / monthlyBurnRate) : Infinity;

    return {
      monthlyBurnRate: Math.round(Math.max(0, monthlyBurnRate)),
      runwayMonths: runwayMonths === Infinity ? 999 : runwayMonths,
      cashBalance: Math.round(cashBalance),
    };
  }

  // ─── Unit Economics ──────────────────────────────────────────

  /**
   * Calculate CAC, LTV, LTV/CAC ratio, and payback period.
   */
  calculateUnitEconomics(assumptions: FinancialAssumptions): UnitEconomicsResult {
    const cac = assumptions.cacPerCustomer;
    const monthlyRevenuePerCustomer = assumptions.avgRevenuePerCustomer;
    const lifetimeMonths =
      assumptions.monthlyChurnRate > 0
        ? 1 / assumptions.monthlyChurnRate
        : assumptions.avgCustomerLifetimeMonths;
    const ltv = monthlyRevenuePerCustomer * lifetimeMonths;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const paybackPeriodMonths =
      monthlyRevenuePerCustomer > 0 ? Math.ceil(cac / monthlyRevenuePerCustomer) : Infinity;

    const healthy = ltvCacRatio >= 3;

    return {
      cac: Math.round(cac),
      ltv: Math.round(ltv),
      ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
      paybackPeriodMonths,
      healthy,
      explanation: healthy
        ? `LTV/CAC ratio of ${ltvCacRatio.toFixed(1)}:1 exceeds the healthy threshold of 3:1. The business has strong unit economics.`
        : `LTV/CAC ratio of ${ltvCacRatio.toFixed(1)}:1 is below the ideal 3:1 threshold. Consider reducing CAC or improving retention to strengthen unit economics.`,
    };
  }

  // ─── DCF Valuation ───────────────────────────────────────────

  /**
   * Discounted Cash Flow valuation.
   */
  calculateDCFValuation(
    annualCashFlows: number[],
    discountRate: number = 0.15,
    terminalGrowthRate: number = 0.03,
  ): number {
    let dcfValue = 0;

    for (let i = 0; i < annualCashFlows.length; i++) {
      dcfValue += annualCashFlows[i] / Math.pow(1 + discountRate, i + 1);
    }

    // Terminal value using Gordon Growth Model
    const lastCashFlow = annualCashFlows[annualCashFlows.length - 1] || 0;
    if (discountRate > terminalGrowthRate && lastCashFlow > 0) {
      const terminalValue =
        (lastCashFlow * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
      dcfValue += terminalValue / Math.pow(1 + discountRate, annualCashFlows.length);
    }

    return Math.round(dcfValue);
  }

  // ─── ECharts Configuration Generators ────────────────────────

  /**
   * Revenue forecast chart (3-scenario line chart).
   */
  generateRevenueChartConfig(
    projections: { conservative: YearlyProjection[]; realistic: YearlyProjection[]; optimistic: YearlyProjection[] },
    currencySymbol: string = '₹',
  ): EChartsOption {
    return {
      title: { text: 'Revenue Forecast (3-Year)', left: 'center' },
      tooltip: { trigger: 'axis', formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        return params.map((p: any) => `${p.seriesName}: ${currencySymbol}${(p.value / 100000).toFixed(1)}L`).join('<br/>');
      }},
      legend: { data: ['Conservative', 'Realistic', 'Optimistic'], bottom: 0 },
      color: ['#6366f1', '#10b981', '#f59e0b'],
      grid: { left: '12%', right: '5%', top: '15%', bottom: '15%' },
      xAxis: {
        type: 'category',
        data: ['Year 1', 'Year 2', 'Year 3'],
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => `${currencySymbol}${(value / 100000).toFixed(0)}L` },
      },
      series: [
        { name: 'Conservative', type: 'line', data: projections.conservative.map(p => p.revenue), smooth: true, areaStyle: { opacity: 0.1 } },
        { name: 'Realistic', type: 'line', data: projections.realistic.map(p => p.revenue), smooth: true, lineStyle: { width: 3 }, areaStyle: { opacity: 0.15 } },
        { name: 'Optimistic', type: 'line', data: projections.optimistic.map(p => p.revenue), smooth: true, areaStyle: { opacity: 0.1 } },
      ],
    };
  }

  /**
   * Cash flow chart (bar + line combo).
   */
  generateCashFlowChartConfig(cashFlow: CashFlowProjection[], currencySymbol: string = '₹'): EChartsOption {
    return {
      title: { text: 'Cash Flow Projection (12 Months)', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Inflow', 'Outflow', 'Cumulative Cash'], bottom: 0 },
      color: ['#10b981', '#ef4444', '#6366f1'],
      grid: { left: '12%', right: '5%', top: '15%', bottom: '15%' },
      xAxis: {
        type: 'category',
        data: cashFlow.map(c => c.label),
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => `${currencySymbol}${(value / 100000).toFixed(0)}L` },
      },
      series: [
        { name: 'Inflow', type: 'bar', data: cashFlow.map(c => c.inflow), barGap: '0%' },
        { name: 'Outflow', type: 'bar', data: cashFlow.map(c => c.outflow) },
        { name: 'Cumulative Cash', type: 'line', data: cashFlow.map(c => c.cumulativeCash), smooth: true, lineStyle: { width: 3 } },
      ],
    };
  }

  /**
   * Break-even analysis chart.
   */
  generateBreakEvenChartConfig(
    breakEven: BreakEvenResult,
    monthlyProjections: MonthlyProjection[],
    currencySymbol: string = '₹',
  ): EChartsOption {
    const months = monthlyProjections.slice(0, Math.min(breakEven.breakEvenMonths + 6, 36));

    return {
      title: { text: 'Break-Even Analysis', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Revenue', 'Total Costs', 'Profit/Loss'], bottom: 0 },
      color: ['#10b981', '#ef4444', '#6366f1'],
      grid: { left: '12%', right: '5%', top: '15%', bottom: '15%' },
      xAxis: {
        type: 'category',
        data: months.map(m => m.label),
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => `${currencySymbol}${(value / 100000).toFixed(0)}L` },
      },
      series: [
        { name: 'Revenue', type: 'line', data: months.map(m => m.revenue), smooth: true },
        { name: 'Total Costs', type: 'line', data: months.map(m => m.expenses), smooth: true, lineStyle: { type: 'dashed' } },
        {
          name: 'Profit/Loss',
          type: 'bar',
          data: months.map(m => m.profit),
          itemStyle: { color: (params: any) => (params.value >= 0 ? '#10b981' : '#ef4444') },
        },
        // Break-even marker line
        ...(breakEven.breakEvenMonths < 120
          ? [{
              name: 'Break-Even',
              type: 'line' as const,
              markLine: {
                data: [{ xAxis: `Month ${breakEven.breakEvenMonths}` }],
                label: { formatter: `Break-Even\nMonth ${breakEven.breakEvenMonths}` },
                lineStyle: { color: '#f59e0b', type: 'dashed' as const },
              },
              data: [] as number[],
            }]
          : []),
      ],
    };
  }

  /**
   * Market size (TAM/SAM/SOM) funnel/pie chart.
   */
  generateMarketSizeChartConfig(
    tam: number,
    sam: number,
    som: number,
    currencySymbol: string = '₹',
  ): EChartsOption {
    return {
      title: { text: 'Market Size (TAM / SAM / SOM)', left: 'center' },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) =>
          `${params.name}: ${currencySymbol}${(params.value / 10000000).toFixed(1)} Cr`,
      },
      color: ['#6366f1', '#8b5cf6', '#a78bfa'],
      series: [
        {
          type: 'funnel',
          left: '10%',
          top: '15%',
          width: '80%',
          min: 0,
          max: tam,
          sort: 'descending',
          gap: 4,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) =>
              `${params.name}\n${currencySymbol}${(params.value / 10000000).toFixed(1)} Cr`,
          },
          data: [
            { value: tam, name: 'TAM (Total Addressable Market)' },
            { value: sam, name: 'SAM (Serviceable Addressable Market)' },
            { value: som, name: 'SOM (Serviceable Obtainable Market)' },
          ],
        },
      ],
    };
  }

  /**
   * Profit projection chart.
   */
  generateProfitChartConfig(
    projections: { conservative: YearlyProjection[]; realistic: YearlyProjection[]; optimistic: YearlyProjection[] },
    currencySymbol: string = '₹',
  ): EChartsOption {
    return {
      title: { text: 'Profit Projection (3-Year)', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Conservative', 'Realistic', 'Optimistic'], bottom: 0 },
      color: ['#6366f1', '#10b981', '#f59e0b'],
      grid: { left: '12%', right: '5%', top: '15%', bottom: '15%' },
      xAxis: {
        type: 'category',
        data: ['Year 1', 'Year 2', 'Year 3'],
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => `${currencySymbol}${(value / 100000).toFixed(0)}L` },
      },
      series: [
        { name: 'Conservative', type: 'bar', data: projections.conservative.map(p => p.profit), barGap: '0%' },
        { name: 'Realistic', type: 'bar', data: projections.realistic.map(p => p.profit) },
        { name: 'Optimistic', type: 'bar', data: projections.optimistic.map(p => p.profit) },
      ],
    };
  }

  /**
   * Risk heatmap chart.
   */
  generateRiskHeatmapConfig(
    risks: { category: string; severity: string; description: string }[],
  ): EChartsOption {
    const categories = ['Market', 'Financial', 'Regulatory', 'Technical', 'Operational'];
    const severityMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

    const heatmapData: [number, number, number][] = [];
    categories.forEach((cat, catIdx) => {
      const categoryRisks = risks.filter(
        (r) => r.category.toLowerCase() === cat.toLowerCase(),
      );
      const avgSeverity =
        categoryRisks.length > 0
          ? categoryRisks.reduce((sum, r) => sum + (severityMap[r.severity] || 1), 0) /
            categoryRisks.length
          : 0;
      heatmapData.push([catIdx, 0, Math.round(avgSeverity * 33.3)]);
    });

    return {
      title: { text: 'Risk Heatmap', left: 'center' },
      tooltip: {
        formatter: (params: any) => {
          const riskLevel = params.value[2] > 66 ? 'High' : params.value[2] > 33 ? 'Medium' : 'Low';
          return `${categories[params.value[0]]}: ${riskLevel} Risk (${params.value[2]}%)`;
        },
      },
      grid: { left: '15%', right: '10%', top: '15%', bottom: '10%' },
      xAxis: { type: 'category', data: categories, splitArea: { show: true } },
      yAxis: { type: 'category', data: ['Risk Level'], splitArea: { show: true } },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: { color: ['#10b981', '#f59e0b', '#ef4444'] },
      },
      series: [
        {
          name: 'Risk',
          type: 'heatmap',
          data: heatmapData,
          label: { show: true, formatter: (params: any) => `${params.value[2]}%` },
        },
      ],
    };
  }

  /**
   * KPI dashboard gauge charts.
   */
  generateKPIDashboardConfig(kpis: {
    ideaScore: number;
    marketScore: number;
    investorScore: number;
    riskScore: number;
  }): EChartsOption {
    const gaugeData = [
      { name: 'Idea Score', value: kpis.ideaScore, color: '#6366f1' },
      { name: 'Market Score', value: kpis.marketScore, color: '#10b981' },
      { name: 'Investor Score', value: kpis.investorScore, color: '#f59e0b' },
      { name: 'Risk Score', value: kpis.riskScore, color: '#ef4444' },
    ];

    return {
      title: { text: 'KPI Dashboard', left: 'center' },
      series: gaugeData.map((kpi, index) => ({
        type: 'gauge',
        center: [`${15 + index * 23}%`, '55%'],
        radius: '35%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        detail: { formatter: `{value}`, fontSize: 16, offsetCenter: [0, '70%'] },
        title: { fontSize: 12, offsetCenter: [0, '90%'] },
        data: [{ value: kpi.value, name: kpi.name }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.3, '#ef4444'],
              [0.7, '#f59e0b'],
              [1, '#10b981'],
            ],
          },
        },
        pointer: { width: 4 },
      })),
    };
  }
}
