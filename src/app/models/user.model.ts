export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'resident' | 'security';
    complex_id?: string;
    house_id?: string;
    must_change_password?: boolean;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }