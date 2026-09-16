# Pork and Garlic Ice Cream Co. — Year 2 Winter Decision Tool

A responsive React + Vite + TypeScript classroom decision tool. All calculations run locally in the browser; no data is sent to a server.

## Start it locally

```bash
npm install
npm run dev
```

For a production check, run `npm run build`. Run `npx vitest run` for the calculation checks.

## Where to enter your real Year 1 figures

Open the page and use the **Year 1 starting position** section at the top. Replace every field marked **Imported — verify**, especially closing cash, annual profit, loans, loss pool, and machine/depreciation inputs. The visible validation note is deliberate: do not rely on the Year 2 results until annual profit and closing cash reconcile to the classroom model.

The corrected Year 1 P&L statement shows **net profit of 7,771**, **annual depreciation of 17,500**, and a **closing tax-loss pool of zero** ILS. Closing cash is not shown in the P&L statement: the provisional prefill of **−21,254** reconstructs cash from the 100,000 opening cash, 100,000 revenue, and visible cash costs (including the 35,000 machine purchase). Replace it with the Cash Flow statement's confirmed closing cash when available. The machine count/value/life fields remain provisional.

## Calculation logic

- Revenue = actual allocated sales (capped at production) × selling price. A sales request is comparison context, not revenue.
- Cost of sales = planned production × unit production cost + milk purchased × milk cost.
- Unsold units = production − allocated sales. Spoilage/write-off = unsold units × unit production cost × editable write-off rate.
- Gross profit = revenue − cost of sales − spoilage. PBT then subtracts operating expenses, depreciation, and interest.
- Losses carried forward offset positive PBT; tax applies only to the remaining taxable profit.
- Cash flow keeps non-cash depreciation out of cash movements. It deducts production/milk/operating cash, capital spending, interest and tax; then adds borrowing.

## Sample strategy assumptions — change when Year 2 rules arrive

**Strategy A (cautious)** uses 18,000 units of production and allocated sales, a shared lower-rent premises option, modest marketing, no new capex and no new borrowing. It assumes a higher Year 2 selling price of Sh 4.40 per unit. It is a profitable estimate, not a confirmed forecast.

**Strategy B (growth)** uses 32,000 units, two tons of milk, a dedicated premises option, greater marketing, 20,000 of capital spending and 15,000 borrowing. It assumes 30,000 allocated sales at Sh 4.35 per unit, leaving 2,000 unsold units. This is intentionally a higher operational-risk plan, not a confirmed forecast.

Both plans assume a 100% winter write-off on unsold units and a 10% tax rate only because those rules were not confirmed. Change the write-off rate to zero if stock can be carried forward, then model its later sale/expiry separately. New-loan interest is assumed for one winter period; change it if your class uses another timing convention.

## Publish to GitHub and Vercel

1. Create an empty GitHub repository, then push this folder to its `main` branch.
2. In Vercel, choose **Add New → Project**, import that repository, and accept the detected **Vite** framework settings.
3. Click **Deploy**. Vercel will run `npm run build` and publish the `dist` folder.
4. Open the deployment URL and check the two strategy cards, the sales slider, and mobile layout.

No environment variables are required.

### If Vercel says `TS18003: No inputs were found`

Vercel is building the wrong folder. The selected project root must contain `package.json`, `index.html`, `src/`, and `tsconfig.json` at the same level. Upload the *contents* of this folder to the root of the GitHub repository, rather than uploading its parent `outputs/` folder. If the GitHub repository intentionally keeps this project in a subfolder, set Vercel's **Root Directory** to that exact subfolder before deploying.
