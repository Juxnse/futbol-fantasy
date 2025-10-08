export interface User {
  id: string;
  document?: string;
  document_type?: string;
  name: string;
  last_name1?: string;
  last_name2?: string;
  email: string;
  phone?: string;
  role?: 'user' | 'admin';
  password?: string;
  picture?: string;
  provider?: 'local' | 'google';
  createdAt?: string;
}
