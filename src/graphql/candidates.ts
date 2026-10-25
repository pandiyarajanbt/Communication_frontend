import candidatesQuery from './operations/candidates.gql?raw'
import createCandidateMutation from './operations/createCandidate.gql?raw'
import deleteCandidateMutation from './operations/deleteCandidate.gql?raw'
import sendWhatsappMessageMutation from './operations/sendWhatsappMessage.gql?raw'
import sendWhatsappBulkMutation from './operations/sendWhatsappBulk.gql?raw'
import { requestGraphQL } from './client'
import type { Candidate, Communication, MessageStatus } from '../types'

type ApiMessage = {
  messageId: string | null
  message: string
  status: string | null
  timestamp: string
}

type ApiCandidate = {
  id: string
  candidateId: string
  fullName: string
  phoneNumber: string
  lastMessage: string | null
  whatsappMessageId: string | null
  status: string | null
  timestamp: string | null
  messages: ApiMessage[] | null
}

type CandidatesResponse = {
  candidates: {
    edges: Array<{ node: ApiCandidate }>
  } | null
}

type CreateCandidateResponse = {
  createCandidate: {
    candidate: {
      candidateId: string
      fullName: string
      phoneNumber: string
      status: string | null
    } | null
  } | null
}

type DeleteCandidateResponse = {
  deleteCandidate: {
    found: boolean
    deletedId: string | null
    deletedRawId: string | null
  } | null
}

type SendWhatsappMessageResponse = {
  sendWhatsappMessage: {
    ok: boolean
    error: string | null
  } | null
}

type SendWhatsappBulkResponse = {
  sendWhatsappBulk: {
    count: number
    successCount: number
    failedCount: number
    results: Array<{
      candidateId: string
      name: string
      ok: boolean
      error: string | null
    }>
  } | null
}

export type SendWhatsappMessageResult = NonNullable<SendWhatsappMessageResponse['sendWhatsappMessage']>
export type SendWhatsappBulkResult = NonNullable<SendWhatsappBulkResponse['sendWhatsappBulk']>
export type CreatedCandidate = NonNullable<NonNullable<CreateCandidateResponse['createCandidate']>['candidate']>
export type DeleteCandidateResult = NonNullable<DeleteCandidateResponse['deleteCandidate']>

function mapStatus(status: string | null): MessageStatus | null {
  switch (status?.toLowerCase()) {
    case 'read':
      return 'read'
    case 'failed':
    case 'undelivered':
    case 'canceled':
      return 'failed'
    case 'sent':
    case 'queued':
    case 'accepted':
    case 'sending':
    case 'delivered':
      return 'sent'
    default:
      return null
  }
}

function formatApiTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp

  const day = `${date.getDate()}`.padStart(2, '0')
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const dateLabel = `${day}-${month}-${date.getFullYear()}`
  const timeLabel = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  return `${dateLabel} ${timeLabel}`
}

function mapMessage(message: ApiMessage, candidateId: string, index: number): Communication {
  return {
    id: message.messageId || `${candidateId}-${message.timestamp}-${index}`,
    sentAt: formatApiTimestamp(message.timestamp),
    body: message.message,
    status: mapStatus(message.status) ?? 'failed',
  }
}

function mapCandidate(node: ApiCandidate): Candidate {
  const communications = (node.messages ?? []).map((message, index) => mapMessage(message, node.candidateId, index))
  const latestCommunication = communications[0]

  return {
    id: node.candidateId,
    candidateId: node.candidateId,
    graphqlId: node.id,
    name: node.fullName,
    phone: node.phoneNumber,
    email: '',
    lastMessage: node.lastMessage ?? (latestCommunication ? latestCommunication.sentAt.split(' ')[0] : null),
    whatsappMessageId: node.whatsappMessageId,
    timestamp: node.timestamp,
    status: mapStatus(node.status),
    communications,
  }
}

export async function fetchCandidates(token: string): Promise<Candidate[]> {
  const result = await requestGraphQL<CandidatesResponse>(candidatesQuery, {}, token)
  return (result.candidates?.edges ?? []).map(({ node }) => mapCandidate(node))
}

export async function createCandidate(
  fullName: string,
  phoneNumber: string,
  status: string,
  token: string,
): Promise<CreatedCandidate> {
  const result = await requestGraphQL<CreateCandidateResponse>(
    createCandidateMutation,
    { fullName, phoneNumber, status },
    token,
  )

  const candidate = result.createCandidate?.candidate
  if (!candidate) throw new Error('The server did not return the created candidate.')
  return candidate
}

export async function deleteCandidate(id: string, token: string): Promise<DeleteCandidateResult> {
  const result = await requestGraphQL<DeleteCandidateResponse>(deleteCandidateMutation, { id }, token)

  if (!result.deleteCandidate) throw new Error('The server did not return a candidate deletion result.')
  return result.deleteCandidate
}

export async function sendWhatsappMessage(
  candidateId: number,
  template: string,
  params: string[],
  token: string,
): Promise<SendWhatsappMessageResult> {
  const result = await requestGraphQL<SendWhatsappMessageResponse>(
    sendWhatsappMessageMutation,
    { candidateId, template, params },
    token,
  )

  if (!result.sendWhatsappMessage) throw new Error('The server did not return a WhatsApp message result.')
  return result.sendWhatsappMessage
}

export async function sendWhatsappBulk(
  candidateIds: number[],
  template: string,
  token: string,
): Promise<SendWhatsappBulkResult> {
  const result = await requestGraphQL<SendWhatsappBulkResponse>(
    sendWhatsappBulkMutation,
    { candidateIds, template },
    token,
  )

  if (!result.sendWhatsappBulk) throw new Error('The server did not return a bulk WhatsApp message result.')
  return result.sendWhatsappBulk
}
