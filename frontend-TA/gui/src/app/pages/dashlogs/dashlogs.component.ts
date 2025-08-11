import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashlogs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashlogs.component.html',
  styleUrls: ['./dashlogs.component.css']
})
export class DashlogsComponent implements OnInit, AfterViewInit {
  logs: any[] = [];
  totalLogs = 0;
  statusCount: { [code: string]: number } = {};
  avgResponseTime = 0;
  minResponseTime = 0;
  mostUsedApi = '';
  leastUsedApi = '';

  statusChart: Chart | null = null;
  apiChart: Chart | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://127.0.0.1:5004/api/logs').subscribe({
      next: (data) => {
        this.logs = data;
        this.totalLogs = this.logs.length;

        this.countStatusCodes();
        this.avgResponseTime = this.calculateAvgResponseTime();
        this.minResponseTime = this.calculateMinResponseTime();
        this.calculateApiUsage();

        this.createStatusChart();
        this.createApiChart();
      },
      error: (err) => {
        console.error('Error al obtener logs:', err);
      }
    });
  }

  ngAfterViewInit() {
  }

  countStatusCodes() {
    this.statusCount = this.logs.reduce((acc, log) => {
      const code = log.statusCode || 'Desconocido';
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as { [code: string]: number });
  }

  calculateAvgResponseTime() {
    const times = this.logs
      .map(log => log.responseTime)
      .filter(t => typeof t === 'number') as number[];

    if (times.length === 0) return 0;

    const total = times.reduce((acc, curr) => acc + curr, 0);
    return total / times.length;
  }

  calculateMinResponseTime() {
    const times = this.logs
      .map(log => log.responseTime)
      .filter(t => typeof t === 'number') as number[];

    return times.length > 0 ? Math.min(...times) : 0;
  }

  calculateApiUsage() {
    const apiCount: { [endpoint: string]: number } = {};

    this.logs.forEach(log => {
      const endpoint = log.endpoint || 'Desconocido';
      apiCount[endpoint] = (apiCount[endpoint] || 0) + 1;
    });

    const sorted = Object.entries(apiCount).sort((a, b) => b[1] - a[1]);
    this.mostUsedApi = sorted[0]?.[0] || '';
    this.leastUsedApi = sorted[sorted.length - 1]?.[0] || '';

    this.apiUsageData = apiCount;
  }

  apiUsageData: { [endpoint: string]: number } = {};

  createStatusChart() {
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    this.statusChart = new Chart('statusChart', {
      type: 'bar',
      data: {
        labels: Object.keys(this.statusCount),
        datasets: [{
          label: 'Cantidad de Status Codes',
          data: Object.values(this.statusCount),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return Number(value).toFixed(0);
              }
            }
          }
        }
      }
    });
  }

  createApiChart() {
    if (this.apiChart) {
      this.apiChart.destroy();
    }
    const labels = Object.keys(this.apiUsageData);
    const data = Object.values(this.apiUsageData);

    this.apiChart = new Chart('apiChart', {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Uso de APIs',
          data,
          backgroundColor: labels.map(() => this.getRandomColor()),
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  // Helper para generar colores random para el pie chart
  getRandomColor(): string {
    const r = Math.floor(Math.random() * 200) + 30;
    const g = Math.floor(Math.random() * 200) + 30;
    const b = Math.floor(Math.random() * 200) + 30;
    return `rgba(${r},${g},${b},0.7)`;
  }
}
