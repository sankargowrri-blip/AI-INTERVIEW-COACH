import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
