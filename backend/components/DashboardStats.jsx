import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AmChart from './AmChart';

const DashboardStats = () => {
  const [data, setData] = useState({
    monthlySignups: [],
    userRoles: [],
    dailyConversations: [],
    dailyMessages: [],
    notificationTypes: [],
    dailyComments: [],
    ratingsDistribution: [],
    appointmentsByStatus: [],
    topSkills: [],
    dailyLikes: [],
    stripeStats: {},
  });

  useEffect(() => {
    axios
      .get('/admin/api/dashboard')
      .then((res) => {
     setData({
      ...res.data[0],         // stats classiques
      stripeStats: res.data[1] // stripe dans un champ dédié
    });
      })
      .catch((err) => {
        console.error('Erreur dashboard', err);
      });
  }, []);

  const charts = [
    {
      id: 'monthlySignups',
      title: 'Inscriptions mensuelles',
      type: 'bar',
      data: data.monthlySignups,
      categoryField: 'month',
      valueField: 'count',
    },
    // … autres charts comme avant …
  ];

  const stripeCharts = [
    {
      id: 'stripeMonthlyRevenue',
      title: 'Revenus Stripe mensuels',
      type: 'line',
      data: data.stripeStats.stripeMonthlyRevenue || [],
      categoryField: 'month',
      valueField: 'total',
    },
    {
      id: 'stripeMonthlyPaymentCounts',
      title: 'Paiements Stripe mensuels',
      type: 'bar',
      data: data.stripeStats.stripeMonthlyPaymentCounts || [],
      categoryField: 'month',
      valueField: 'count',
    },
    {
      id: 'stripeCurrencyDistribution',
      title: 'Répartition par devise',
      type: 'pie',
      data: data.stripeStats.stripeCurrencyDistribution || [],
      categoryField: 'currency',
      valueField: 'total',
    },
    {
      id: 'stripePaymentMethodsDistribution',
      title: 'Moyens de paiement',
      type: 'doughnut',
      data: data.stripeStats.stripePaymentMethodsDistribution || [],
      categoryField: 'type',
      valueField: 'count',
    },
    {
      id: 'stripeTopCustomers',
      title: 'Top clients',
      type: 'bar',
      data: data.stripeStats.stripeTopCustomers || [],
      categoryField: 'customer',
      valueField: 'total',
    },
  ];

  const kpis = [
    {
      label: 'Paiements réussis',
      value: data.stripeStats.stripeSucceededPayments || 0,
    },
    {
      label: 'Paiements échoués',
      value: data.stripeStats.stripeFailedPayments || 0,
    },
    {
      label: 'Paiements remboursés',
      value: data.stripeStats.stripeRefundedPayments || 0,
    },
    {
      label: 'Montant remboursé',
      value: `${data.stripeStats.stripeRefundedTotal || 0} €`,
    },
    {
      label: 'Paiement moyen',
      value: `${data.stripeStats.stripeAveragePayment?.toFixed(2) || 0} €`,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
     
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              flex: '1 1 150px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{kpi.value}</div>
            <div>{kpi.label}</div>
          </div>
        ))}
      </div>

      <h2>Stats principales</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {charts.map((chart) => (
          <AmChart key={chart.id} {...chart} />
        ))}
      </div>

      <h2>Stats Stripe</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {stripeCharts.map((chart) => (
          <AmChart key={chart.id} {...chart} />
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
