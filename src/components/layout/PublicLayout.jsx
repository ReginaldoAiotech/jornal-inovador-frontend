import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import PublicSidebar from './PublicSidebar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <div className="flex-1 flex">
        <PublicSidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
