import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  otp = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login(this.username, this.password, this.otp).subscribe({
      next: (response: any) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          this.error = '';
          this.router.navigate(['/tasks']);
        } else {
          this.error = 'No se recibió un token válido';
        }
      },
      error: () => {
        this.error = 'Credenciales u OTP incorrectos';
        localStorage.removeItem('token');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
