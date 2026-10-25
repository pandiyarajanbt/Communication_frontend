import Close from '@mui/icons-material/Close'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'

type DeleteDialogProps = {
  open: boolean
  names: string[]
  deleting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteDialog({ open, names, deleting = false, onCancel, onConfirm }: DeleteDialogProps) {
  const count = names.length
  const multiple = count > 1

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle className="!flex !items-center !justify-between !pt-8 !text-xl !font-medium">
        Delete Candidate
          <IconButton aria-label="Close delete confirmation" onClick={onCancel} disabled={deleting}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className="!pb-10 !pt-7">
        <p className="mb-1 text-base text-slate-900">
          Are you sure you want to delete {multiple ? `${count} Candidates` : 'this Candidate'}?
        </p>
        <p className="text-xs leading-5 text-slate-500">
          This action cannot be undone, and you’ll lose all communication history with{' '}
          {multiple ? 'these candidates' : names[0] ?? 'this candidate'}.
        </p>
      </DialogContent>
      <DialogActions className="!border-t !border-slate-200 !px-10 !py-6">
        <Button onClick={onCancel} variant="outlined" disabled={deleting} className="!px-5">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={deleting} className="!px-5">
          {deleting ? 'Deleting…' : multiple ? `Delete ${count} Candidates` : 'Delete Candidate'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
