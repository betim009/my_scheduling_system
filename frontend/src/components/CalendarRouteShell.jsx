import Layout from './Layout'
import PublicPageLayout from './PublicPageLayout'
import useAuth from '../hooks/useAuth'
import LoadingState from './common/LoadingState'

function CalendarRouteShell({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingState message="Preparando calendário..." />
  }

  if (isAuthenticated) {
    return <Layout>{children}</Layout>
  }

  return (
    <PublicPageLayout
      title="Calendário público"
      subtitle="Visualize horários disponíveis e crie sua conta para agendar."
    >
      {children}
    </PublicPageLayout>
  )
}

export default CalendarRouteShell
