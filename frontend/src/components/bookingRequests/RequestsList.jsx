import { Stack } from '@mui/material'
import RequestCard from './RequestCard'

function RequestsList({ requests, onCancelRequest, cancellingRequestId }) {
  return (
    <Stack spacing={2}>
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onCancel={onCancelRequest}
          cancelling={cancellingRequestId === request.id}
        />
      ))}
    </Stack>
  )
}

export default RequestsList
