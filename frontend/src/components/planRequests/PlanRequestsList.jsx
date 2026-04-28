import { Stack } from '@mui/material'
import PlanRequestCard from './PlanRequestCard'

function PlanRequestsList({ requests }) {
  return (
    <Stack spacing={2}>
      {requests.map((request) => (
        <PlanRequestCard key={request.id} request={request} />
      ))}
    </Stack>
  )
}

export default PlanRequestsList
