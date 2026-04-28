import { Navigate, Route, Routes } from 'react-router-dom'
import CalendarRouteShell from '../components/CalendarRouteShell'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminAvailabilityExceptions from '../pages/AdminAvailabilityExceptions/index.jsx'
import AdminAvailabilityRules from '../pages/AdminAvailabilityRules/index.jsx'
import AdminBookingRequests from '../pages/AdminBookingRequests/index.jsx'
import AdminBookings from '../pages/AdminBookings/index.jsx'
import AdminCalendarGeneration from '../pages/AdminCalendarGeneration/index.jsx'
import AdminPlans from '../pages/AdminPlans/index.jsx'
import AdminPlanRequests from '../pages/AdminPlanRequests/index.jsx'
import AdminSystemSettings from '../pages/AdminSystemSettings/index.jsx'
import AdminSubscriptions from '../pages/AdminSubscriptions/index.jsx'
import Calendar from '../pages/Calendar/index.jsx'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import MyBookings from '../pages/MyBookings/index.jsx'
import MyBookingRequests from '../pages/MyBookingRequests/index.jsx'
import MySubscriptions from '../pages/MySubscriptions/index.jsx'
import Plans from '../pages/Plans'
import ProfilePage from '../pages/Profile/index.jsx'
import Register from '../pages/Register'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/calendar" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/calendar"
        element={
          <CalendarRouteShell>
            <Calendar />
          </CalendarRouteShell>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<Layout />}>
          <Route path="/my-booking-requests" element={<MyBookingRequests />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-subscriptions" element={<MySubscriptions />} />
          <Route path="/plans" element={<Plans />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin/booking-requests" element={<AdminBookingRequests />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/availability-rules" element={<AdminAvailabilityRules />} />
          <Route
            path="/admin/availability-exceptions"
            element={<AdminAvailabilityExceptions />}
          />
          <Route
            path="/admin/calendar-generation"
            element={<AdminCalendarGeneration />}
          />
          <Route path="/admin/plan-requests" element={<AdminPlanRequests />} />
          <Route path="/admin/plans" element={<AdminPlans />} />
          <Route path="/admin/system-settings" element={<AdminSystemSettings />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        </Route>
      </Route>

      <Route path="/requests" element={<Navigate to="/my-booking-requests" replace />} />

      <Route path="*" element={<Navigate to="/calendar" replace />} />
    </Routes>
  )
}

export default AppRouter
