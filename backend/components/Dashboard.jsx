import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AmChart from './AmChart';

const Dashboard = () => {
  const [data, setData] = useState({
    monthlySignups: [],
    userRoles: [],
    dailyConversations: [],
    dailyMessages: [],
    notificationTypes: [],
    dailyComments: [],
    ratingsDistribution: [],
    appointmentsByStatus: [],
    dailyLikes: [],
    // Ajout des stats globales
    totalConversations: 0,
    totalAppointments: 0,
    acceptedAppointments: 0,
    refusedAppointments: 0,
  });

  useEffect(() => {
    axios
      .get('/admin/api/dashboard')
      .then((res) => {
        setData({ ...data, ...res.data[0] });
      })
      .catch((err) => {
        console.error('Erreur dashboard', err);
      });
    // eslint-disable-next-line
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
    {
      id: 'userRoles',
      title: 'Rôles utilisateurs',
      type: 'doughnut',
      data: data.userRoles,
      categoryField: 'role',
      valueField: 'count',
    },
    {
      id: 'dailyConversations',
      title: 'Conversations quotidiennes',
      type: 'line',
      data: data.dailyConversations,
      categoryField: 'date',
      valueField: 'count',
    },
    {
      id: 'dailyMessages',
      title: 'Messages quotidiens',
      type: 'line',
      data: data.dailyMessages,
      categoryField: 'date',
      valueField: 'count',
    },
    {
      id: 'notificationTypes',
      title: 'Types de notifications',
      type: 'pie',
      data: data.notificationTypes,
      categoryField: 'type',
      valueField: 'count',
    },
    {
      id: 'dailyComments',
      title: 'Commentaires quotidiens',
      type: 'bar',
      data: data.dailyComments,
      categoryField: 'date',
      valueField: 'count',
    },
    {
      id: 'ratingsDistribution',
      title: 'Répartition des notes',
      type: 'doughnut',
      data: data.ratingsDistribution.map((i) => ({
        rating: `Note ${i.rating}`,
        count: i.count,
      })),
      categoryField: 'rating',
      valueField: 'count',
    },
    {
      id: 'appointmentsByStatus',
      title: 'Statuts des rendez-vous',
      type: 'pie',
      data: data.appointmentsByStatus,
      categoryField: 'status',
      valueField: 'count',
    },
    {
      id: 'dailyLikes',
      title: 'Likes quotidiens',
      type: 'line',
      data: data.dailyLikes,
      categoryField: 'date',
      valueField: 'count',
    },
  ];

  // Affichage des stats globales sous forme de cards (style Stripe)
  const globalStats = [
    { label: 'Conversations totales', value: data.totalConversations },
    { label: 'Rendez-vous totaux', value: data.totalAppointments },
    { label: 'Rendez-vous acceptés', value: data.acceptedAppointments },
    { label: 'Rendez-vous refusés', value: data.refusedAppointments },
  ];

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {globalStats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              flex: '1 1 150px',
              textAlign: 'center',
              boxShadow: '0 2px 8px #0001',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stat.value}</div>
            <div>{stat.label}</div>
          </div>
        ))}
      </div>
      {charts.map((chart) => (
        <AmChart key={chart.id} {...chart} />
      ))}
    </div>
  );
};

export default Dashboard;