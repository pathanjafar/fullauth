import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrendChart({ expenses }) {
  const chartData = useMemo(() => {
    // Generate array of last 30 days
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    // Calculate totals for each day
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const dailyTotals = last30Days.map(date => {
      return safeExpenses
        .filter(e => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0);
    });

    return {
      labels: last30Days.map(d => d.slice(8, 10) + '/' + d.slice(5, 7)),
      datasets: [
        {
          fill: true,
          label: 'Daily Spending',
          data: dailyTotals,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#050505',
          pointBorderWidth: 2,
          borderWidth: 3,
        },
      ],
    };
  }, [expenses]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `₹${context.parsed.y.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { 
          color: '#64748b',
          font: { size: 10, family: 'Outfit', weight: '500' },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10
        } 
      },
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { 
          color: '#64748b',
          font: { size: 10, family: 'Outfit', weight: '500' },
          callback: value => '₹' + value.toLocaleString('en-IN')
        }
      },
    },
  };

  return (
    <div className="trend-chart-container" style={{ height: '240px', width: '100%', marginTop: '1rem' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
