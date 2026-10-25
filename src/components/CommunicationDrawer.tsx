import Close from '@mui/icons-material/Close'
import { Button, Chip, Drawer, IconButton, TextField } from '@mui/material'
import type { Candidate, Communication } from '../types'
import EmptyState from './EmptyState'
import StatusBadge from './StatusBadge'

export type DrawerContent =
  | { type: 'history'; candidate: Candidate }
  | { type: 'message'; recipients: Candidate[] }

type CommunicationDrawerProps = {
  content: DrawerContent | null
  message: string
  onMessageChange: (message: string) => void
  onClose: () => void
  onSend: () => void
}

function formatHistoryDate(sentAt: string) {
  const [date, time] = sentAt.split(' ')
  return time ? `${date}  |  ${time}` : date
}

function HistoryItem({ communication }: { communication: Communication }) {
  return (
    <article className="history-item">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500">{formatHistoryDate(communication.sentAt)}</span>
        <StatusBadge status={communication.status} />
      </div>
      <p className="whitespace-pre-wrap text-base leading-[1.4] text-slate-900">{communication.body}</p>
    </article>
  )
}

export default function CommunicationDrawer({
  content,
  message,
  onMessageChange,
  onClose,
  onSend,
}: CommunicationDrawerProps) {
  const isHistory = content?.type === 'history'
  const recipients = content?.type === 'message' ? content.recipients : []
  const visibleRecipients = recipients.length > 9 ? recipients.slice(0, 9) : recipients
  const hiddenCount = recipients.length - visibleRecipients.length
  const candidate = content?.type === 'history' ? content.candidate : null
  const communications = candidate?.communications ?? []

  return (
    <Drawer
      anchor="right"
      open={Boolean(content)}
      onClose={onClose}
      PaperProps={{ className: 'communication-drawer' }}
    >
      {content && (
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex shrink-0 items-center justify-between px-10 pb-5 pt-9">
            <h2 className="text-xl font-medium text-slate-950">
              {isHistory ? 'Communication history' : 'Send Message'}
            </h2>
            <IconButton aria-label="Close panel" onClick={onClose} size="small">
              <Close />
            </IconButton>
          </header>

          {isHistory && candidate ? (
            <>
              <div className="shrink-0 px-10 pb-8 pt-5">
                <p className="mb-2 text-xs tracking-wide text-slate-500">Candidate ID: {candidate.id}</p>
                <h3 className="mb-1 text-2xl font-medium text-black">{candidate.name}</h3>
                <p className="mb-2 text-base text-slate-900">{candidate.phone}</p>
                <p className="text-base text-slate-900">{candidate.email}</p>
              </div>
              {communications.length > 0 ? (
                <div className="history-list min-h-0 flex-1 overflow-y-auto px-10">
                  {communications.map((communication) => (
                    <HistoryItem key={communication.id} communication={communication} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <EmptyState kind="history" />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-10 pt-5">
                <p className="mb-2 text-base text-slate-900">
                  {recipients.length} {recipients.length === 1 ? 'Recipient' : 'Recipients'}
                </p>
                <div className="recipient-chips mb-8 flex flex-wrap gap-2">
                  {visibleRecipients.map((recipient) => (
                    <Chip key={recipient.id} label={recipient.name} size="small" />
                  ))}
                  {hiddenCount > 0 && <span className="self-center text-sm text-slate-700">+ {hiddenCount}</span>}
                </div>
                <label htmlFor="message-body" className="mb-1 block text-base text-slate-900">
                  Message <span className="text-red-600">*</span>
                </label>
                <p className="mb-2 text-xs tracking-wide text-slate-500">Type, or paste the message you want to send.</p>
                <TextField
                  id="message-body"
                  value={message}
                  onChange={(event) => onMessageChange(event.target.value)}
                  placeholder="Type or paste here..."
                  multiline
                  minRows={6}
                  fullWidth
                  className="message-textarea"
                />
              </div>
              <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-10 py-6">
                <Button onClick={onClose} variant="outlined" className="!px-5">Cancel</Button>
                <Button onClick={onSend} variant="contained" disabled={!message.trim()} className="!px-5">
                  Send Message
                </Button>
              </footer>
            </>
          )}
        </div>
      )}
    </Drawer>
  )
}
