import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  // Placeholder for future Google OAuth implementation
  login() {
    console.log('Login functionality coming soon');
  }

  logout() {
    console.log('Logout functionality coming soon');
  }

  isAuthenticated(): boolean {
    // For now, always return true
    return true;
  }
}