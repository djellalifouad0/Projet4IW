const axios = require('axios');

async function getStripeStats() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not set');

  const now = new Date();
  const last12Months = new Date();
  last12Months.setMonth(now.getMonth() - 11);
  const startTimestamp = Math.floor(last12Months.getTime() / 1000);

  let hasMore = true;
  let startingAfter = undefined;

  const chargesData = [];

  while (hasMore) {
    const params = new URLSearchParams({
      'created[gte]': startTimestamp,
      limit: 100
    });
    if (startingAfter) params.append('starting_after', startingAfter);

    const res = await axios.get(`https://api.stripe.com/v1/charges?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    });

    const json = res.data;

    chargesData.push(...json.data);
    hasMore = json.has_more;
    startingAfter = json.data.at(-1)?.id;
  }

  // Agrégation des stats
  const monthlyTotals = {};
  const monthlyCounts = {};
  let succeeded = 0;
  let failed = 0;
  let refundedCount = 0;
  let refundedTotal = 0;
  let totalAmount = 0;

  const customerTotals = {};
  const currencyTotals = {};
  const paymentMethodTypes = {};

  for (const charge of chargesData) {
    const date = new Date(charge.created * 1000);
    const month = date.toISOString().slice(0, 7);

    if (!monthlyTotals[month]) {
      monthlyTotals[month] = 0;
      monthlyCounts[month] = 0;
    }

    monthlyTotals[month] += charge.amount / 100;
    monthlyCounts[month] += 1;

    totalAmount += charge.amount / 100;

    if (charge.status === 'succeeded') {
      succeeded++;
    } else {
      failed++;
    }

    if (charge.refunded || charge.amount_refunded > 0) {
      refundedCount++;
      refundedTotal += charge.amount_refunded / 100;
    }

    if (charge.customer) {
      customerTotals[charge.customer] = (customerTotals[charge.customer] || 0) + charge.amount / 100;
    }

    currencyTotals[charge.currency] = (currencyTotals[charge.currency] || 0) + charge.amount / 100;

    const pmType = charge.payment_method_details?.type || 'unknown';
    paymentMethodTypes[pmType] = (paymentMethodTypes[pmType] || 0) + 1;
  }
  const monthlyRevenueSorted = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
  const monthlyCountsSorted = Object.entries(monthlyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
  const topCustomers = Object.entries(customerTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([customer, total]) => ({ customer, total }));
  const currencyDistribution = Object.entries(currencyTotals)
    .map(([currency, total]) => ({ currency, total }));
  const paymentMethodsDistribution = Object.entries(paymentMethodTypes)
    .map(([type, count]) => ({ type, count }));
    console.log( {
    stripeMonthlyRevenue: monthlyRevenueSorted,
    stripeMonthlyPaymentCounts: monthlyCountsSorted,
    stripeSucceededPayments: succeeded,
    stripeFailedPayments: failed,
    stripeRefundedPayments: refundedCount,
    stripeRefundedTotal: refundedTotal,
    stripeAveragePayment: succeeded ? (totalAmount / succeeded).toFixed(2) : 0,
    stripeTopCustomers: topCustomers,
    stripeCurrencyDistribution: currencyDistribution,
    stripePaymentMethodsDistribution: paymentMethodsDistribution
  })
  return {
    stripeMonthlyRevenue: monthlyRevenueSorted,
    stripeMonthlyPaymentCounts: monthlyCountsSorted,
    stripeSucceededPayments: succeeded,
    stripeFailedPayments: failed,
    stripeRefundedPayments: refundedCount,
    stripeRefundedTotal: refundedTotal,
stripeAveragePayment: succeeded ? Math.round((totalAmount / succeeded) * 100) / 100 : 0,    stripeTopCustomers: topCustomers,
    stripeCurrencyDistribution: currencyDistribution,
    stripePaymentMethodsDistribution: paymentMethodsDistribution
  };
}
module.exports = getStripeStats;
