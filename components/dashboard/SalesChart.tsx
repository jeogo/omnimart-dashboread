"use client";

import React from 'react';
import { SalesByDate } from '@/types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: SalesByDate[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  // Format date labels for Arabic display
  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-DZ', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: sortedData.map(item => formatDateLabel(item.date)),
    datasets: [
      {
        label: 'المبيعات (د.ج)',
        data: sortedData.map(item => item.amount),
        fill: 'start',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Cairo, sans-serif'
          }
        }
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('ar-DZ').format(context.parsed.y) + ' د.ج';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Cairo, sans-serif'
          }
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          font: {
            family: 'Cairo, sans-serif'
          },
          callback: function(value: any) {
            return new Intl.NumberFormat('ar-DZ').format(value) + ' د.ج';
          }
        }
      }
    }
  };

  return (
    <div className="h-full w-full">
      {data.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          لا توجد بيانات مبيعات متاحة للعرض
        </div>
      )}
    </div>
  );
};

export default SalesChart;
