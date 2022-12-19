import { useState } from 'react'

import { Message } from '@root/components'

function formatFeedback(feedback: string, id: number) {
  if (!feedback) return <></>
  if (feedback.startsWith('ERRO'))
    return (
      <Message key={`${feedback}${id}`} variant="error">
        <span>{feedback}</span>
      </Message>
    )
  return (
    <Message key={`${feedback}${id}`} variant="success">
      <span>{feedback}</span>
    </Message>
  )
}

export function useFeedback() {
  const [feedbacks, setFeedbacks] = useState([] as string[])
  const addFeedback = (feedback: string) =>
    setFeedbacks((old) => [...old, feedback])

  const Messages = feedbacks.map((feedback, idx) =>
    formatFeedback(feedback, idx)
  )

  return { addFeedback, Messages }
}
