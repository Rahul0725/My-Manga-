import { User } from '../types';
import * as DB from './db';

// Simulate a password hash
const simpleHash = (str: string) => str.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0).toString();

export const login = async (email: string, password: string): Promise<User> => {
  let user = await DB.getUserByEmail(email);

  // DEMO FIX: Auto-seed admin user if missing and credentials match demo
  if (!user && email === 'admin@mymanga.com' && password === 'password') {
    const adminUser: User = {
      id: 'admin-seed',
      name: 'System Admin',
      email: 'admin@mymanga.com',
      passwordHash: simpleHash('password'),
      isAdmin: true
    };
    await DB.addUser(adminUser);
    user = adminUser;
  }

  if (!user) throw new Error("User not found");
  
  if (user.passwordHash !== simpleHash(password)) {
    throw new Error("Invalid password");
  }
  return user;
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
  const existing = await DB.getUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  // First user is Admin if email is 'admin@mymanga.com', otherwise standard user
  // This is a simple rule for the demo
  const isAdmin = email === 'admin@mymanga.com';

  const newUser: User = {
    id: DB.generateId(),
    name,
    email,
    passwordHash: simpleHash(password),
    isAdmin
  };

  await DB.addUser(newUser);
  return newUser;
};