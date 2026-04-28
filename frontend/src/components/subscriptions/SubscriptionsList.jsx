import { Stack } from '@mui/material'
import SubscriptionCard from './SubscriptionCard'

function SubscriptionsList({ subscriptions }) {
  const sortedSubscriptions = [...subscriptions].sort((left, right) => {
    if (left.status === 'active' && right.status !== 'active') {
      return -1
    }

    if (left.status !== 'active' && right.status === 'active') {
      return 1
    }

    return right.start_date.localeCompare(left.start_date)
  })

  return (
    <Stack spacing={2}>
      {sortedSubscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </Stack>
  )
}

export default SubscriptionsList
