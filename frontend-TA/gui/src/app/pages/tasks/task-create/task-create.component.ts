import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Task {
  name_task: string;
  desc_task: string;
  deadline: string;
  status: number;
  isActive: boolean;
}

interface Status {
  id: number;
  name: string;
}

interface ApiResponse {
  message: string;
  task_id?: number;
}

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css']
})
export class TaskCreateComponent implements OnInit {
  private readonly API_GATEWAY_URL = 'http://127.0.0.1:5000';

  task: Task = {
    name_task: '',
    desc_task: '',
    deadline: '',
    status: 0,
    isActive: true
  };

  statusList: Status[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  showSuccess = false;
  minDate = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadStatus();
  }

  private loadStatus(): void {
    this.isLoading = true;
    this.statusList = [
       { id: 1, name: 'In progress' },
       { id: 2, name: 'Revision' },
       { id: 3, name: 'Completed' },
       { id: 4, name: 'Paused' }
    ];
    this.isLoading = false;
  }

  onSubmit(): void {
  this.errorMessage = null;
  if (this.isSubmitting || !this.validateForm()) return;

  this.isSubmitting = true;

  const token = localStorage.getItem('token') || '';

  const headers = new HttpHeaders({
    'Authorization': token
  });

  this.http.post<ApiResponse>(
    `${this.API_GATEWAY_URL}/tasks`,
    this.task, // Solo enviamos lo que el usuario llenó
    { headers }
  ).subscribe({
    next: () => {
      this.showSuccessMessage();
      this.resetForm();
      setTimeout(() => this.router.navigate(['/tasks']), 2000);
    },
    error: (error) => {
      this.handleError(this.getErrorMessage(error));
      this.isSubmitting = false;
    }
  });
}


  // validaciones
  private validateForm(): boolean {
    const { name_task, desc_task, deadline, status } = this.task;
    if (!name_task.trim()) return this.setError('El nombre de la tarea es requerido');
    if (name_task.trim().length < 3) return this.setError('El nombre debe tener al menos 3 caracteres');
    if (!desc_task.trim()) return this.setError('La descripción es requerida');
    if (desc_task.trim().length < 10) return this.setError('La descripción debe tener al menos 10 caracteres');
    if (!deadline) return this.setError('La fecha límite es requerida');
    if (new Date(deadline) < new Date(new Date().setHours(0, 0, 0, 0)))
      return this.setError('La fecha límite no puede ser en el pasado');
    if (status === 0) return this.setError('El estado es requerido');
    return true;
  }

  private setError(message: string): boolean {
    this.errorMessage = message;
    return false;
  }

  private showSuccessMessage(): void {
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 3000);
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = null), 5000);
  }

  private getErrorMessage(error: any): string {
    if (error.error?.error) return error.error.error;
    if ([401, 403].includes(error.status)) {
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return 'No autorizado. Inicia sesión nuevamente.';
    }
    if (error.status === 400) return 'Datos inválidos.';
    if (error.status === 500) return 'Error interno del servidor.';
    if (error.status === 502) return 'Error de comunicación con el servidor.';
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    return 'Error inesperado.';
  }

  private resetForm(): void {
    this.task = {
      name_task: '',
      desc_task: '',
      deadline: '',
      status: 0,
      isActive: true
    };
    this.isSubmitting = false;
  }

  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      const confirmLeave = confirm('¿Cancelar? Los cambios no guardados se perderán.');
      if (!confirmLeave) return;
    }
    this.router.navigate(['/tasks']);
  }

  private hasUnsavedChanges(): boolean {
    const { name_task, desc_task, deadline, status } = this.task;
    return !!(name_task.trim() || desc_task.trim() || deadline || status);
  }

  onFieldChange(): void {
    this.errorMessage = null;
  }

  getFieldError(fieldName: string): string | null {
    const { name_task, desc_task, deadline, status } = this.task;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    switch (fieldName) {
      case 'name_task':
        if (!name_task.trim()) return 'El nombre es requerido';
        if (name_task.trim().length < 3) return 'Mínimo 3 caracteres';
        break;
      case 'desc_task':
        if (!desc_task.trim()) return 'La descripción es requerida';
        if (desc_task.trim().length < 10) return 'Mínimo 10 caracteres';
        break;
      case 'deadline':
        if (!deadline) return 'La fecha es requerida';
        if (new Date(deadline) < today) return 'No puede ser en el pasado';
        break;
      case 'status':
        if (status === 0) return 'Selecciona un estado';
        break;
    }
    return null;
  }

  isFieldValid(fieldName: string): boolean {
    return !this.getFieldError(fieldName);
  }
}
