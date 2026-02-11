import { redirect } from 'next/navigation';

/**
 * Root Page
 * Redirects to login page
 */
export default function HomePage() {
  redirect('/login');
}
