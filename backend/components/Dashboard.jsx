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
    topSkills: [],
    dailyLikes: [],
  });

  useEffect(() => {
    axios
      .get('/admin/api/dashboard')
      .then((res) => {
        console.log('Données du dashboard', res.data);
        setData(res.data[0]);
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
      id: 'topSkills',
      title: 'Top 10 compétences',
      type: 'bar',
      data: data.topSkills,
      categoryField: 'description',
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

  return (
    <div style={{ padding: '20px' }}>
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
    </div>
  );
};

export default Dashboard;
