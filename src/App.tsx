import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Vendors from '@/pages/Vendors';
import VendorDetail from '@/pages/VendorDetail';
import Contracts from '@/pages/Contracts';
import Timeline from '@/pages/Timeline';
import Collaboration from '@/pages/Collaboration';
import Guests from '@/pages/Guests';
import Seating from '@/pages/Seating';
import WeddingDay from '@/pages/WeddingDay';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/:id" element={<VendorDetail />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/collaboration" element={<Collaboration />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/seating" element={<Seating />} />
          <Route path="/wedding-day" element={<WeddingDay />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
