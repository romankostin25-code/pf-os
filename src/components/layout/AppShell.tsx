import { Outlet } from 'react-router-dom';
import NavSidebar from './NavSidebar';

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
