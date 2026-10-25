export type MessageStatus = 'read' | 'failed' | 'sent'

export type Communication = {
  id: string
  sentAt: string
  body: string
  status: MessageStatus
}

export type Candidate = {
  id: string
  name: string
  phone: string
  email: string
  lastMessage: string | null
  status: MessageStatus | null
  communications: Communication[]
}

export type CandidateDraft = Pick<Candidate, 'name' | 'phone' | 'email'>
