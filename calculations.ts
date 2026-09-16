export type Year1 = {
  closingCash: number;
  annualProfit: number;
  machines: number;
  machineValue: number;
  remainingLife: number;
  annualDepreciation: number;
  unpaidLoans: number;
  loanRate: number;
  taxLosses: number;
  otherOpeningCashNeeds: number;
};
export type Strategy = {
  name: string;
  production: number;
  milkTons: number;
  salesRequest: number;
  actualSales: number;
  price: number;
  productionCost: number;
  milkCost: number;
  spoilageRate: number;
  marketInvestment: number;
  premises: string;
  rent: number;
  machineUseCost: number;
  machineDepreciation: number;
  transport: number;
  otherOperating: number;
  capex: number;
  borrowing: number;
  loanRate: number;
  taxRate: number;
};
export type Result = ReturnType<typeof calculate>;
export const calculate = (y: Year1, s: Strategy, salesFactor = 1) => {
  const sales = Math.min(
    s.production,
    Math.max(0, s.actualSales * salesFactor),
  );
  const unsold = Math.max(0, s.production - sales);
  const revenue = sales * s.price;
  const production = s.production * s.productionCost;
  const milk = s.milkTons * s.milkCost;
  const spoilage = unsold * s.productionCost * s.spoilageRate;
  const costOfSales = production + milk;
  const grossProfit = revenue - costOfSales - spoilage;
  const operating =
    s.marketInvestment +
    s.rent +
    s.machineUseCost +
    s.transport +
    s.otherOperating;
  const depreciation = s.machineDepreciation;
  const interest = y.unpaidLoans * y.loanRate + s.borrowing * s.loanRate;
  const pbt = grossProfit - operating - depreciation - interest;
  const lossUsed = Math.min(Math.max(0, pbt), y.taxLosses);
  const taxableProfit = Math.max(0, pbt - lossUsed);
  const tax = taxableProfit * s.taxRate;
  const netProfit = pbt - tax;
  // Cash is intentionally separate from profit: depreciation is non-cash, capex is cash.
  const operatingCash = revenue - production - milk - spoilage - operating;
  const preFinanceCash =
    y.closingCash -
    y.otherOpeningCashNeeds +
    operatingCash -
    s.capex -
    interest -
    tax;
  const closingCash = preFinanceCash + s.borrowing;
  return {
    sales,
    unsold,
    revenue,
    production,
    milk,
    spoilage,
    costOfSales,
    grossProfit,
    operating,
    depreciation,
    interest,
    pbt,
    lossUsed,
    taxableProfit,
    tax,
    netProfit,
    operatingCash,
    preFinanceCash,
    closingCash,
    lossCarryForward: y.taxLosses - lossUsed,
  };
};
