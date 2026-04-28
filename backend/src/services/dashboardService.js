const { pool } = require('../database/connection');

async function getAdminSummary() {
  const [
    [studentsRows],
    [pendingRequestsRows],
    [confirmedBookingsRows],
    [activeSubscriptionsRows],
    [plansRows],
    [recentPendingRequests],
    [upcomingBookings],
  ] = await Promise.all([
    pool.execute(
      `
        SELECT COUNT(*) AS total_students
        FROM users
        WHERE role = 'student'
      `
    ),
    pool.execute(
      `
        SELECT COUNT(*) AS total_pending_requests
        FROM booking_requests
        WHERE status = 'pending'
      `
    ),
    pool.execute(
      `
        SELECT COUNT(*) AS total_confirmed_bookings
        FROM bookings
        WHERE status = 'confirmed'
      `
    ),
    pool.execute(
      `
        SELECT
          COUNT(*) AS total_active_subscriptions,
          COALESCE(SUM(remaining_classes), 0) AS total_remaining_classes
        FROM subscriptions
        WHERE status = 'active'
      `
    ),
    pool.execute(
      `
        SELECT COUNT(*) AS total_plans
        FROM plans
      `
    ),
    pool.execute(
      `
        SELECT
          br.id,
          br.student_id,
          br.teacher_id,
          br.requested_date,
          br.start_time,
          br.end_time,
          br.status,
          br.student_message,
          br.admin_message,
          br.created_at,
          student.name AS student_name,
          student.email AS student_email
        FROM booking_requests br
        INNER JOIN users student ON student.id = br.student_id
        WHERE br.status = 'pending'
        ORDER BY br.created_at DESC, br.id DESC
        LIMIT 5
      `
    ),
    pool.execute(
      `
        SELECT
          b.id,
          b.student_id,
          b.teacher_id,
          b.booking_date,
          b.start_time,
          b.end_time,
          b.status,
          b.created_at,
          student.name AS student_name,
          student.email AS student_email
        FROM bookings b
        INNER JOIN users student ON student.id = b.student_id
        WHERE b.status = 'confirmed'
          AND b.booking_date >= CURDATE()
        ORDER BY b.booking_date ASC, b.start_time ASC, b.id ASC
        LIMIT 5
      `
    ),
  ]);

  return {
    metrics: {
      total_students: Number(studentsRows[0]?.total_students || 0),
      total_pending_requests: Number(pendingRequestsRows[0]?.total_pending_requests || 0),
      total_confirmed_bookings: Number(
        confirmedBookingsRows[0]?.total_confirmed_bookings || 0
      ),
      total_active_subscriptions: Number(
        activeSubscriptionsRows[0]?.total_active_subscriptions || 0
      ),
      total_remaining_classes: Number(
        activeSubscriptionsRows[0]?.total_remaining_classes || 0
      ),
      total_plans: Number(plansRows[0]?.total_plans || 0),
    },
    recent_pending_requests: recentPendingRequests,
    upcoming_bookings: upcomingBookings,
  };
}

module.exports = {
  getAdminSummary,
};
