import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { calculate, type Strategy, type Year1 } from "./calculations";
import "./styles.css";

const imported: Year1 = {
  closingCash: -21254,
  annualProfit: 7771,
  machines: 1,
  machineValue: 35000,
  remainingLife: 4,
  annualDepreciation: 17500,
  unpaidLoans: 0,
  loanRate: 0,
  taxLosses: 0,
  otherOpeningCashNeeds: 0,
};
const cautious: Strategy = {
  name: "Strategy A — Cautious / cash-protective",
  production: 18000,
  milkTons: 1,
  salesRequest: 18000,
  actualSales: 18000,
  price: 4.4,
  productionCost: 0.72,
  milkCost: 20000,
  spoilageRate: 1,
  marketInvestment: 2000,
  premises: "Shared / lower-rent option",
  rent: 4000,
  machineUseCost: 1200,
  machineDepreciation: 4375,
  transport: 2200,
  otherOperating: 2800,
  capex: 0,
  borrowing: 0,
  loanRate: 0.1,
  taxRate: 0.1,
};
const growth: Strategy = {
  name: "Strategy B — Growth / higher-sales",
  production: 32000,
  milkTons: 2,
  salesRequest: 32000,
  actualSales: 30000,
  price: 4.35,
  productionCost: 0.65,
  milkCost: 20000,
  spoilageRate: 1,
  marketInvestment: 7500,
  premises: "Dedicated / higher-capacity option",
  rent: 10000,
  machineUseCost: 2500,
  machineDepreciation: 8750,
  transport: 4500,
  otherOperating: 7000,
  capex: 20000,
  borrowing: 15000,
  loanRate: 0.12,
  taxRate: 0.1,
};
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});
const num = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const fmt = (n: number) => money.format(n);
const percent = (n: number) => `${(n * 100).toFixed(0)}%`;
const fields: {
  key: keyof Strategy;
  label: string;
  unit?: string;
  kind?: "text";
}[] = [
  { key: "production", label: "Planned production", unit: "units" },
  { key: "milkTons", label: "Milk purchase", unit: "tons" },
  { key: "salesRequest", label: "Sales request", unit: "units" },
  {
    key: "actualSales",
    label: "Possible actual sales allocation",
    unit: "units",
  },
  { key: "price", label: "Selling price per unit", unit: "ILS" },
  { key: "productionCost", label: "Production cost per unit", unit: "ILS" },
  { key: "milkCost", label: "Milk cost per ton", unit: "ILS" },
  {
    key: "spoilageRate",
    label: "Spoilage / unsold write-off rate (1.00 = 100%)",
    unit: "decimal",
  },
  { key: "marketInvestment", label: "Market investment", unit: "ILS" },
  { key: "premises", label: "Premises choice", kind: "text" },
  { key: "rent", label: "Premises rent", unit: "ILS" },
  { key: "machineUseCost", label: "Machine use / maintenance", unit: "ILS" },
  { key: "machineDepreciation", label: "Machine depreciation", unit: "ILS" },
  { key: "transport", label: "Transport", unit: "ILS" },
  { key: "otherOperating", label: "Other operating costs", unit: "ILS" },
  {
    key: "capex",
    label: "Capital spending / machine cash payment",
    unit: "ILS",
  },
  { key: "borrowing", label: "Borrowing amount", unit: "ILS" },
  {
    key: "loanRate",
    label: "New loan interest rate (0.10 = 10%)",
    unit: "decimal",
  },
  { key: "taxRate", label: "Tax rate (0.10 = 10%)", unit: "decimal" },
];
function NumberField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  return (
    <label className="field">
      <span>
        {label}
        <small>Imported — verify</small>
      </span>
      <div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit && <em>{unit}</em>}
      </div>
    </label>
  );
}
function StrategyCard({
  strategy,
  setStrategy,
  y1,
  salesFactor,
}: {
  strategy: Strategy;
  setStrategy: (s: Strategy) => void;
  y1: Year1;
  salesFactor: number;
}) {
  const r = calculate(y1, strategy, salesFactor);
  const change = (key: keyof Strategy, v: string) =>
    setStrategy({
      ...strategy,
      [key]: typeof strategy[key] === "number" ? Number(v) : v,
    } as Strategy);
  const alert = [] as string[];
  if (r.preFinanceCash < 0)
    alert.push(
      `Cash is ${fmt(-r.preFinanceCash)} negative before borrowing / advance funding.`,
    );
  if (r.closingCash < 0)
    alert.push(`Closing cash is ${fmt(-r.closingCash)} negative.`);
  if (r.unsold > strategy.production * 0.1)
    alert.push(
      `${num(r.unsold)} unsold units (${percent(r.unsold / strategy.production)}) could be spoiled or need a carry-forward rule.`,
    );
  if (strategy.borrowing > 0)
    alert.push(
      `Borrowing of ${fmt(strategy.borrowing)} is required in this estimate.`,
    );
  return (
    <article className="strategy">
      <header>
        <div>
          <p className="eyebrow">Year 2 winter scenario</p>
          <h2>{strategy.name}</h2>
        </div>
        <span className={r.closingCash >= 0 ? "badge good" : "badge risk"}>
          {r.closingCash >= 0 ? "Cash positive" : "Cash risk"}
        </span>
      </header>
      <section className="inputs">
        <h3>Editable estimates</h3>
        <p>None of these are confirmed Year 2 rules.</p>
        <div className="field-grid">
          {fields.map((f) => (
            <label key={String(f.key)} className="field">
              <span>
                {f.label}
                <small>Estimate – editable</small>
              </span>
              <div>
                {f.kind === "text" ? (
                  <input
                    value={String(strategy[f.key])}
                    onChange={(e) => change(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="number"
                    step={f.unit === "decimal" ? "0.01" : "1"}
                    value={strategy[f.key] as number}
                    onChange={(e) => change(f.key, e.target.value)}
                  />
                )}
                <em>{f.unit}</em>
              </div>
            </label>
          ))}
        </div>
      </section>
      <section className="results">
        <h3>Profit & loss</h3>
        <Metric
          label="Actual allocated sales"
          value={`${num(r.sales)} units`}
        />
        <Metric
          label="Revenue (allocated sales × price)"
          value={fmt(r.revenue)}
        />
        <Metric label="Cost of sales / production" value={fmt(r.costOfSales)} />
        <Metric
          label="Spoilage / unsold inventory cost"
          value={fmt(r.spoilage)}
        />
        <Metric label="Gross profit" value={fmt(r.grossProfit)} strong />
        <Metric label="Operating expenses" value={fmt(r.operating)} />
        <Metric label="Depreciation (non-cash)" value={fmt(r.depreciation)} />
        <Metric label="Interest expense" value={fmt(r.interest)} />
        <Metric label="Profit before tax" value={fmt(r.pbt)} strong />
        <Metric label="Tax losses used" value={fmt(r.lossUsed)} />
        <Metric label="Tax expense" value={fmt(r.tax)} />
        <Metric label="Net profit" value={fmt(r.netProfit)} strong />
      </section>
      <section className="results cash">
        <h3>Cash flow</h3>
        <Metric label="Opening cash" value={fmt(y1.closingCash)} />
        <Metric label="Operating cash movements" value={fmt(r.operatingCash)} />
        <Metric
          label="Capital spending / machine cash"
          value={fmt(-strategy.capex)}
        />
        <Metric
          label="Interest and tax payments"
          value={fmt(-r.interest - r.tax)}
        />
        <Metric label="Cash before borrowing" value={fmt(r.preFinanceCash)} />
        <Metric label="Borrowing received" value={fmt(strategy.borrowing)} />
        <Metric label="Closing cash" value={fmt(r.closingCash)} strong />
      </section>
      {alert.length > 0 && (
        <section className="warnings">
          {alert.map((a) => (
            <p key={a}>⚠ {a}</p>
          ))}
        </section>
      )}
    </article>
  );
}
function Metric({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={strong ? "metric strong" : "metric"}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
function App() {
  const [y1, setY1] = useState(imported);
  const [a, setA] = useState(cautious);
  const [b, setB] = useState(growth);
  const [factor, setFactor] = useState(1);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [assumption, setAssumption] = useState(
    "This recommendation depends on actual allocated sales being at least 18,000 units for Strategy A and the estimated Year 2 selling price being achievable.",
  );
  const ar = useMemo(() => calculate(y1, a, factor), [y1, a, factor]);
  const br = useMemo(() => calculate(y1, b, factor), [y1, b, factor]);
  const defaultRecommendation = useMemo(() => {
    const choices = [
      { strategy: a, result: ar },
      { strategy: b, result: br },
    ];
    const cashPositive = choices.filter(
      (choice) => choice.result.closingCash >= 0,
    );
    const pool = cashPositive.length > 0 ? cashPositive : choices;
    const chosen = [...pool].sort(
      (left, right) => right.result.netProfit - left.result.netProfit,
    )[0];
    const other = choices.find((choice) => choice !== chosen)!;
    const cashMessage =
      cashPositive.length > 0
        ? "keeps closing cash positive"
        : "has the stronger closing-cash position, although both plans are cash-negative";
    return `Recommendation: choose ${chosen.strategy.name}. It ${cashMessage} and has the better risk-adjusted profit: ${fmt(chosen.result.netProfit)} versus ${fmt(other.result.netProfit)}. It needs ${fmt(chosen.strategy.borrowing)} borrowing versus ${fmt(other.strategy.borrowing)}, and leaves ${num(chosen.result.unsold)} unsold units versus ${num(other.result.unsold)}. Closing cash is ${fmt(chosen.result.closingCash)} versus ${fmt(other.result.closingCash)}. Update the inputs or use the lower-sales tool; this recommendation refreshes from the current figures.`;
  }, [a, b, ar, br]);
  return (
    <main>
      <div className="top">
        <p className="eyebrow">
          Pork and Garlic Ice Cream Co. · University decision tool
        </p>
        <h1>Year 2 winter strategy decision</h1>
        <p>
          Compare a cautious and growth plan using your Year 1 autumn position.
          Values are virtual shekels (ILS) unless stated.
        </p>
      </div>
      <div className="validation">
        Check: Year 1 annual profit and closing cash must match the classroom
        model before relying on Year 2 scenarios.
      </div>
      <section className="year-one">
        <h2>Year 1 starting position</h2>
        <p>
          Prefilled from the provided Year 1 workbook where visible; machine
          details are provisional because the workbook did not show a complete
          depreciation schedule.
        </p>
        <div className="field-grid">
          {(
            [
              { key: "closingCash", label: "Closing cash", unit: "ILS" },
              {
                key: "annualProfit",
                label: "Year 1 annual profit",
                unit: "ILS",
              },
              { key: "machines", label: "Owned machines", unit: "count" },
              {
                key: "machineValue",
                label: "Machines purchase value",
                unit: "ILS",
              },
              {
                key: "remainingLife",
                label: "Remaining useful life",
                unit: "seasons",
              },
              {
                key: "annualDepreciation",
                label: "Annual depreciation",
                unit: "ILS",
              },
              { key: "unpaidLoans", label: "Unpaid loans", unit: "ILS" },
              {
                key: "loanRate",
                label: "Annual interest rate (0.10 = 10%)",
                unit: "decimal",
              },
              {
                key: "taxLosses",
                label: "Unused tax losses carried forward",
                unit: "ILS",
              },
              {
                key: "otherOpeningCashNeeds",
                label: "Other opening cash needs / advance payments",
                unit: "ILS",
              },
            ] as const
          ).map((f) => (
            <NumberField
              key={f.key}
              label={f.label}
              unit={f.unit}
              value={y1[f.key]}
              onChange={(v) => setY1({ ...y1, [f.key]: v })}
            />
          ))}
        </div>
      </section>
      <section className="scenario">
        <div>
          <p className="eyebrow">Stress test</p>
          <h2>What if sales are lower?</h2>
          <p>
            Reduce both strategies’ allocated sales; results update immediately.
          </p>
        </div>
        <label>
          Sales allocation kept{" "}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
          />
          <b>{percent(factor)}</b>
        </label>
      </section>
      <section className="strategy-grid">
        <StrategyCard
          strategy={a}
          setStrategy={setA}
          y1={y1}
          salesFactor={factor}
        />
        <StrategyCard
          strategy={b}
          setStrategy={setB}
          y1={y1}
          salesFactor={factor}
        />
      </section>
      <section className="comparison">
        <p className="eyebrow">Decision comparison</p>
        <h2>Strategy A vs Strategy B</h2>
        {[
          [
            "Allocated sales",
            `${num(ar.sales)} units`,
            `${num(br.sales)} units`,
          ],
          ["Revenue", fmt(ar.revenue), fmt(br.revenue)],
          [
            "Unsold / spoilage",
            `${num(ar.unsold)} / ${fmt(ar.spoilage)}`,
            `${num(br.unsold)} / ${fmt(br.spoilage)}`,
          ],
          ["Rent / premises", fmt(a.rent), fmt(b.rent)],
          [
            "Machine / depreciation",
            fmt(a.machineDepreciation),
            fmt(b.machineDepreciation),
          ],
          ["Transport", fmt(a.transport), fmt(b.transport)],
          ["Marketing", fmt(a.marketInvestment), fmt(b.marketInvestment)],
          ["Interest", fmt(ar.interest), fmt(br.interest)],
          ["Net profit", fmt(ar.netProfit), fmt(br.netProfit)],
          ["Closing cash", fmt(ar.closingCash), fmt(br.closingCash)],
        ].map((r) => (
          <div className="compare-row" key={r[0]}>
            <span>{r[0]}</span>
            <b>{r[1]}</b>
            <b>{r[2]}</b>
          </div>
        ))}
      </section>
      <section className="recommend">
        <p className="eyebrow">Editable recommendation</p>
        <textarea
          value={recommendation ?? defaultRecommendation}
          onChange={(e) => setRecommendation(e.target.value)}
        />
        <button type="button" onClick={() => setRecommendation(null)}>
          Refresh default recommendation from current figures
        </button>
        <label>
          Most important assumption
          <textarea
            value={assumption}
            onChange={(e) => setAssumption(e.target.value)}
          />
        </label>
      </section>
      <details>
        <summary>Calculation notes and assumptions</summary>
        <ul>
          <li>
            Revenue uses actual allocated sales, capped at planned
            production—not the sales request.
          </li>
          <li>
            Production and milk purchases are paid in cash. Depreciation affects
            profit but is not paid again in cash. Capital spending is cash-only
            here.
          </li>
          <li>
            Unsold units are charged at production cost × write-off rate. Set
            the rate to 0 if the classroom model permits inventory
            carry-forward, then add its later-period treatment.
          </li>
          <li>
            Tax losses offset positive profit before tax; tax is only charged on
            profit remaining after the loss pool. Interest includes existing
            unpaid loans plus new borrowing for one winter period—edit the rates
            if annual timing differs.
          </li>
          <li>
            Self-check: a plan with negative cash before borrowing flags its
            funding gap. The default sample plans are deliberately estimates,
            based loosely on Year 1’s displayed cost structure, not confirmed
            Year 2 rules.
          </li>
        </ul>
      </details>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
