import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  ChartDataLabels
);

ChartJS.defaults.plugins.datalabels = {
  display: (context: any) => {
    const value = context.dataset.data[context.dataIndex];
    return value !== null && value > 0; 
  },
  formatter: (value: number | null) => {
    if (value === null || value <= 0) return '';
    return `${value}`;
  },
};

export default ChartJS;