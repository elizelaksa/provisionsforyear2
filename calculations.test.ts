import { describe, expect, it } from "vitest";
import { calculate, type Strategy, type Year1 } from "./calculations";

const opening: Year1 = {
  closingCash: 1000,
  annualProfit: 0,
  machines: 0,
  machineValue: 0,
  remainingLife: 0,
  annualDepreciation: 0,
  unpaidLoans: 0,
  loanRate: 0,
  taxLosses: 500,
  otherOpeningCashNeeds: 0,
};
const plan: Strategy = {
  name: "test",
  production: 100,
  milkTons: 0,
  salesRequest: 100,
  actualSales: 80,
  price: 10,
  productionCost: 2,
  milkCost: 0,
  spoilageRate: 1,
  marketInvestment: 10,
  premises: "test",
  rent: 0,
  machineUseCost: 0,
  machineDepreciation: 0,
  transport: 0,
  otherOperating: 0,
  capex: 0,
  borrowing: 0,
  loanRate: 0,
  taxRate: 0.1,
};
describe("winter strategy calculation", () => {
  it("uses allocated sales and expenses unsold production", () => {
    const r = calculate(opening, plan);
    expect(r.revenue).toBe(800);
    expect(r.unsold).toBe(20);
    expect(r.spoilage).toBe(40);
    expect(r.grossProfit).toBe(560);
  });
  it("uses tax losses before charging tax and keeps depreciation out of cash", () => {
    const r = calculate(opening, { ...plan, machineDepreciation: 100 });
    expect(r.lossUsed).toBe(450);
    expect(r.tax).toBe(0);
    expect(r.closingCash).toBe(1550);
  });
  it("reduces revenue when the lower-sales tool is used", () => {
    const r = calculate(opening, plan, 0.5);
    expect(r.sales).toBe(40);
    expect(r.revenue).toBe(400);
    expect(r.unsold).toBe(60);
  });
  it("keeps both revised sample strategies profitable and cash-positive", () => {
    const yearOne: Year1 = { ...opening, closingCash: -21254, taxLosses: 0 };
    const cautious: Strategy = {
      ...plan,
      production: 18000,
      milkTons: 1,
      salesRequest: 18000,
      actualSales: 18000,
      price: 4.4,
      productionCost: 0.72,
      milkCost: 20000,
      marketInvestment: 2000,
      premises: "Shared / lower-rent option",
      rent: 4000,
      machineUseCost: 1200,
      machineDepreciation: 4375,
      transport: 2200,
      otherOperating: 2800,
    };
    const growth: Strategy = {
      ...cautious,
      production: 32000,
      milkTons: 2,
      salesRequest: 32000,
      actualSales: 30000,
      price: 4.35,
      productionCost: 0.65,
      marketInvestment: 7500,
      premises: "Dedicated premises option",
      rent: 10000,
      machineUseCost: 2500,
      machineDepreciation: 8750,
      transport: 4500,
      otherOperating: 7000,
      capex: 20000,
      borrowing: 15000,
      loanRate: 0.12,
    };
    expect(calculate(yearOne, cautious).netProfit).toBeGreaterThan(0);
    expect(calculate(yearOne, cautious).closingCash).toBeGreaterThan(0);
    expect(calculate(yearOne, growth).netProfit).toBeGreaterThan(0);
    expect(calculate(yearOne, growth).closingCash).toBeGreaterThan(0);
  });
});
