"use client";

import React, { useEffect, useState } from 'react';
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
  BarElement,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: SalesByDate[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [chartHeight, setChartHeight] = useState<number>(300);
  
  // Update chart height on window resize for better responsiveness
  useEffect(() => {
    const handleResize = () => {
      setChartHeight(window.innerWidth < 768 ? 220 : 300);
    };
    
    handleResize(); // Initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Create gradients and enhanced styling
  const createGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
    return gradient;
  };

  const chartData = {
    labels: sortedData.map(item => formatDateLabel(item.date)),
    datasets: [
      {
        label: 'المبيعات (د.ج)',
        data: sortedData.map(item => item.amount),
        fill: true,
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            // This can happen when the chart is not yet rendered
            return 'rgba(59, 130, 246, 0.1)';
          }
          return createGradient(ctx);
        },
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointHoverBorderWidth: 2,
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
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          font: {
            family: 'Cairo, sans-serif',
            size: 13
          },
          color: 'rgba(55, 65, 81, 0.8)'
        }
      },
      tooltip: {
        rtl: true,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#334155',
        bodyColor: '#334155',
        borderColor: 'rgba(226, 232, 240, 1)',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('ar-DZ', {
                style: 'decimal',
                maximumFractionDigits: 0
              }).format(context.parsed.y) + ' د.ج';
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          padding: 8,
          font: {
            family: 'Cairo, sans-serif',
            size: 11
          },
          color: 'rgba(107, 114, 128, 0.8)'
        },
        border: {
          display: false
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
          drawBorder: false,
          lineWidth: 1,
        },
        border: {
          display: false
        },
        ticks: {
          padding: 10,
          stepSize: Math.max(...sortedData.map(item => item.amount)) > 0 
            ? Math.ceil(Math.max(...sortedData.map(item => item.amount)) / 5)
            : 1000,
          font: {
            family: 'Cairo, sans-serif',
            size: 11
          },
          color: 'rgba(107, 114, 128, 0.8)',
          callback: function(value: any) {
            if (value === 0) return '0';
            return new Intl.NumberFormat('ar-DZ', {
              notation: 'compact',
              compactDisplay: 'short',
              maximumFractionDigits: 1
            }).format(value);
          }
        }
      }
    },
    elements: {
      line: {
        capBezierPoints: true,
      },
      point: {
        hoverRadius: 6,
        radius: 0, // Hide points initially
        hitRadius: 8, // Increase hit area
      }
    },
    hover: {
      mode: 'nearest' as const,
      intersect: false,
      animationDuration: 150
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
      onComplete(this: ChartJS) {
        // Show only first and last points after animation
        this.data.datasets.forEach((dataset: any, i: number) => {
          const meta = this.getDatasetMeta(i);
          meta.data.forEach((point: any, index: number) => {
            if (index === 0 || index === meta.data.length - 1) {
              point.options.radius = 4;
            }
          });
        });
        this.update();
      }
    }
  };

  return (
    <div className="h-full w-full relative">
      {data.length > 0 ? (
        <div style={{ height: chartHeight }} className="w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-center font-medium">لا توجد بيانات مبيعات متاحة للعرض</p>
          <p className="text-sm mt-1">ستظهر البيانات هنا عند تسجيل المبيعات</p>
        </div>
      )}
    </div>
  );
};

export default SalesChart;
