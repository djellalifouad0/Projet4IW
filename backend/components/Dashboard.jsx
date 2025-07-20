import { ApiClient } from 'adminjs'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useTranslation } from 'adminjs'
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const api = new ApiClient()

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}

const Dashboard = () => {
  const { translateMessage } = useTranslation()
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
  })

  useEffect(() => {
    axios
      .get('/admin/api/dashboard')
      .then((res) => {
        setData(res.data)
      })
      .catch((err) => {
        console.error('Erreur dashboard', err)
      })
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bienvenue sur SkillsSwap Admin 👋</h1>
      <p>Voici les statistiques en direct :</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        {/** Graph helper */}
        {[
          {
            title: 'Inscriptions mensuelles',
            type: 'Bar',
            data: {
              labels: data.monthlySignups.map((i) => i.month),
              datasets: [
                {
                  label: 'Inscriptions',
                  data: data.monthlySignups.map((i) => i.count),
                  backgroundColor: 'rgba(75,192,192,0.6)',
                },
              ],
            },
          },
          {
            title: 'Rôles utilisateurs',
            type: 'Doughnut',
            data: {
              labels: data.userRoles.map((i) => i.role),
              datasets: [
                {
                  data: data.userRoles.map((i) => i.count),
                  backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                  ],
                },
              ],
            },
          },
          {
            title: 'Conversations quotidiennes',
            type: 'Line',
            data: {
              labels: data.dailyConversations.map((i) => i.date),
              datasets: [
                {
                  label: 'Conversations',
                  data: data.dailyConversations.map((i) => i.count),
                  borderColor: 'rgba(153,102,255,0.6)',
                  fill: false,
                },
              ],
            },
          },
          {
            title: 'Messages quotidiens',
            type: 'Line',
            data: {
              labels: data.dailyMessages.map((i) => i.date),
              datasets: [
                {
                  label: 'Messages',
                  data: data.dailyMessages.map((i) => i.count),
                  borderColor: 'rgba(255,159,64,0.6)',
                  fill: false,
                },
              ],
            },
          },
          {
            title: 'Types de notifications',
            type: 'Pie',
            data: {
              labels: data.notificationTypes.map((i) => i.type),
              datasets: [
                {
                  data: data.notificationTypes.map((i) => i.count),
                  backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                  ],
                },
              ],
            },
          },
          {
            title: 'Commentaires quotidiens',
            type: 'Bar',
            data: {
              labels: data.dailyComments.map((i) => i.date),
              datasets: [
                {
                  label: 'Commentaires',
                  data: data.dailyComments.map((i) => i.count),
                  backgroundColor: 'rgba(255,99,132,0.6)',
                },
              ],
            },
          },
          {
            title: 'Répartition des notes',
            type: 'Doughnut',
            data: {
              labels: data.ratingsDistribution.map(
                (i) => `Note ${i.rating}`
              ),
              datasets: [
                {
                  data: data.ratingsDistribution.map((i) => i.count),
                  backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                  ],
                },
              ],
            },
          },
          {
            title: 'Statuts des rendez-vous',
            type: 'Pie',
            data: {
              labels: data.appointmentsByStatus.map((i) => i.status),
              datasets: [
                {
                  data: data.appointmentsByStatus.map((i) => i.count),
                  backgroundColor: ['#FF9F40', '#4BC0C0', '#FF6384'],
                },
              ],
            },
          },
          {
            title: 'Top 10 compétences',
            type: 'Bar',
            data: {
              labels: data.topSkills.map((i) => i.description),
              datasets: [
                {
                  label: 'Demandes',
                  data: data.topSkills.map((i) => i.count),
                  backgroundColor: 'rgba(54,162,235,0.6)',
                },
              ],
            },
          },
          {
            title: 'Likes quotidiens',
            type: 'Line',
            data: {
              labels: data.dailyLikes.map((i) => i.date),
              datasets: [
                {
                  label: 'Likes',
                  data: data.dailyLikes.map((i) => i.count),
                  borderColor: 'rgba(75,192,192,0.6)',
                  fill: false,
                },
              ],
            },
          },
        ].map(({ title, type, data }, idx) => (
          <div key={idx}>
            <h3>{title}</h3>
            <div style={{ height: '250px' }}>
              {type === 'Bar' && <Bar data={data} options={chartOptions} />}
              {type === 'Line' && <Line data={data} options={chartOptions} />}
              {type === 'Doughnut' && <Doughnut data={data} options={chartOptions} />}
              {type === 'Pie' && <Pie data={data} options={chartOptions} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
