import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/DashBoardComponents/Header';
import Landing from './pages/Dashboard pages/Landing';
import Home from './pages/Dashboard pages/Home';
import Services from './pages/Dashboard pages/Services';
import About from './pages/Dashboard pages/About';
import Contact from './pages/Dashboard pages/Contact';
import Calendar from './pages/Dashboard pages/Calendar';
import Signup from './pages/AuthPages/Signup';
import Login from './pages/AuthPages/Login';
import EmailVerification from './pages/AuthPages/EmailVerification';
import Footer from './components/DashBoardComponents/Footer';
import ForgetPassword from './pages/AuthPages/ForgetPassword';
import ResetPassword from './pages/AuthPages/ResetPassword';
import UpdateProfile from './pages/userPages/updateProfile';
import EventDetails from './pages/EventPages/eventDetails';
import Events from './pages/EventPages/Events';
import CreateEvent from './pages/EventPages/createEvent';
import RequestedEvent from './pages/eventAdmin Page/requestedEvent';
import MyEvents from './pages/userPages/myEvents';
import MyTickets from './pages/userPages/myTickets';
import PrivateRoute from './components/privateRoute/privateRoute';
import { AdminRoute, SuperAdminRoute, MemberRoute } from './components/privateRoute/roleRoute';
import BookingPage from './pages/EventPages/bookingPage';
import ApproveEvent from './pages/eventAdmin Page/approveEvent';
import UpdateEvent from './pages/userPages/updateEvents';
import AdminExport from './pages/eventAdmin Page/adminExport';
import AdminStats from './pages/eventAdmin Page/adminStats';
import AdminTickets from './pages/eventAdmin Page/adminTickets';
import AdminDashboard from './pages/eventAdmin Page/adminDashboard';
import NotFound from './pages/Dashboard pages/NotFound';
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verifyEmail" element={<EmailVerification/>} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/events" element = {<Events />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route element={<PrivateRoute />} >
            <Route path="/updateProfile" element={<UpdateProfile />} />
            <Route path='/createEvent' element={<CreateEvent />} />
            <Route path='/my-events' element={<MyEvents />} />
            <Route path='/my-tickets' element={<MyTickets />} />
            <Route path="/my-events/update/:id" element={<UpdateEvent />} />
            </Route>
            <Route element={<MemberRoute />} >
              <Route path="/booking/:eventId" element={<BookingPage />} />
            </Route>
            <Route element={<AdminRoute />} >
            <Route path="/requested_events" element={<RequestedEvent />} />
            <Route path="/requested-event/approve/:eventId" element={<ApproveEvent />} />
            <Route path="/admin/export" element={<AdminExport />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            </Route>
            <Route element={<SuperAdminRoute />} >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;