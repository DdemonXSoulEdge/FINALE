import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/auth'; // Gateway

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  login(username: string, password: string, otp: string): Observable<any> {
  return this.http.post<{ token: string }>(
    `${this.apiUrl}/login`,
    { username, password, otp }
  ).pipe(
    tap(response => {
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
    })
  );
}



  validateToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate_token`, { token });
  }
}
