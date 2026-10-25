import { useEffect, useState, type FormEvent } from 'react'
import Close from '@mui/icons-material/Close'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material'
import type { CandidateDraft } from '../types'

type CandidateDialogProps = {
  open: boolean
  saving?: boolean
  onClose: () => void
  onSave: (draft: CandidateDraft) => void
}

const emptyDraft: CandidateDraft = { name: '', phone: '' }

export default function CandidateDialog({ open, saving = false, onClose, onSave }: CandidateDialogProps) {
  const [draft, setDraft] = useState<CandidateDraft>(emptyDraft)

  useEffect(() => {
    if (open) setDraft(emptyDraft)
  }, [open])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave(draft)
  }

  const setField = (field: keyof CandidateDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="!flex !items-center !justify-between !pb-8 !pt-8 !text-xl !font-medium">
          Add Candidate
          <IconButton aria-label="Close add candidate" onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!flex !flex-col !gap-8 !px-10 !pb-10">
          <TextField
            label="Candidate Name"
            value={draft.name}
            onChange={(event) => setField('name', event.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Mobile Number"
            value={draft.phone}
            onChange={(event) => setField('phone', event.target.value)}
            required
            fullWidth
            type="tel"
          />
        </DialogContent>
        <DialogActions className="!border-t !border-slate-200 !px-10 !py-6">
          <Button onClick={onClose} variant="outlined" disabled={saving} className="!px-5">Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving} className="!px-5">
            {saving ? 'Adding…' : 'Add Candidate'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
