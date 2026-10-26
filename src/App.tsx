import { useEffect, useMemo, useState } from 'react'
import Add from '@mui/icons-material/Add'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import ExitToApp from '@mui/icons-material/ExitToApp'
import FilterList from '@mui/icons-material/FilterList'
import FirstPage from '@mui/icons-material/FirstPage'
import LastPage from '@mui/icons-material/LastPage'
import Search from '@mui/icons-material/Search'
import Send from '@mui/icons-material/Send'
import {
  Alert,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
} from '@mui/material'
import CandidateDialog from './components/CandidateDialog'
import CommunicationDrawer, { type DrawerContent } from './components/CommunicationDrawer'
import DeleteDialog from './components/DeleteDialog'
import EmptyState from './components/EmptyState'
import LoginPage from './components/LoginPage'
import StatusBadge from './components/StatusBadge'
import { clearSession, getStoredSession, getTokenExpiry, loginUser, saveSession, type AuthSession } from './graphql/client'
import { createCandidate, deleteCandidate, fetchCandidates, sendWhatsappBulk, sendWhatsappMessage } from './graphql/candidates'
import type { Candidate, CandidateDraft, MessageStatus } from './types'

type ColumnKey = 'name' | 'phone' | 'lastMessage' | 'status' | 'id'
type DrawerState =
  | { type: 'history'; candidateId: string }
  | { type: 'message'; candidateIds: string[] }
  | null

const columns: { key: ColumnKey; label: string }[] = [
  { key: 'name', label: 'Full name' },
  { key: 'phone', label: 'Mobile number' },
  { key: 'lastMessage', label: 'Last message' },
  { key: 'status', label: 'Status' },
  { key: 'id', label: 'Candidate ID' },
]

function getSortValue(candidate: Candidate, key: ColumnKey) {
  switch (key) {
    case 'name':
      return candidate.name
    case 'phone':
      return candidate.phone
    case 'lastMessage':
      return candidate.lastMessage ?? ''
    case 'status':
      return candidate.status ?? ''
    case 'id':
      return candidate.id
  }
}

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession())
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sort, setSort] = useState<{ key: ColumnKey; direction: 'asc' | 'desc' } | null>(null)
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'none' | 'all'>('all')
  const [filterMenu, setFilterMenu] = useState<{ element: HTMLElement; key: ColumnKey } | null>(null)
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false)
  const [savingCandidate, setSavingCandidate] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCandidates, setDeletingCandidates] = useState(false)
  const [drawerState, setDrawerState] = useState<DrawerState>(null)
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState('')
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success')

  const handleLogin = async (email: string, password: string) => {
    const nextSession = await loginUser({ email, password })
    saveSession(nextSession)
    setSession(nextSession)
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
    setCandidates([])
    setSelectedIds(new Set())
    setDrawerState(null)
    setCandidateDialogOpen(false)
    setDeleteDialogOpen(false)
    setFilterMenu(null)
  }

  useEffect(() => {
    if (!session) return

    const expiry = getTokenExpiry(session.token)
    if (expiry === null) return

    const remainingTime = expiry - Date.now()
    if (remainingTime <= 0) {
      handleLogout()
      return
    }

    const timeoutId = window.setTimeout(handleLogout, remainingTime)
    return () => window.clearTimeout(timeoutId)
  }, [session])

  useEffect(() => {
    if (!session) return

    let active = true
    setLoadingCandidates(true)
    fetchCandidates(session.token)
      .then((nextCandidates) => {
        if (active) setCandidates(nextCandidates)
      })
      .catch((error: unknown) => {
        if (active) {
          setToast(error instanceof Error ? error.message : 'Could not load candidates.')
          setToastSeverity('error')
        }
      })
      .finally(() => {
        if (active) setLoadingCandidates(false)
      })

    return () => { active = false }
  }, [session])

  useEffect(() => {
    const syncSession = () => setSession(getStoredSession())
    window.addEventListener('storage', syncSession)
    return () => window.removeEventListener('storage', syncSession)
  }, [])

  const filteredCandidates = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()
    const matching = candidates.filter((candidate) => {
      const matchesSearch = !searchTerm ||
        [candidate.name, candidate.phone, candidate.email, candidate.id]
          .some((value) => value.toLowerCase().includes(searchTerm))
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'none' ? candidate.status === null : candidate.status === statusFilter)
      return matchesSearch && matchesStatus
    })

    if (!sort) return matching
    return matching.sort((first, second) => {
      const result = getSortValue(first, sort.key).localeCompare(getSortValue(second, sort.key), undefined, {
        numeric: true,
        sensitivity: 'base',
      })
      return sort.direction === 'asc' ? result : -result
    })
  }, [candidates, search, sort, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredCandidates.length / rowsPerPage))
  const pageCandidates = filteredCandidates.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
  const selectedCandidates = candidates.filter((candidate) => selectedIds.has(candidate.id))
  const pageAllSelected = pageCandidates.length > 0 && pageCandidates.every((candidate) => selectedIds.has(candidate.id))
  const drawerContent: DrawerContent | null = useMemo(() => {
    if (!drawerState) return null
    if (drawerState.type === 'history') {
      const candidate = candidates.find((item) => item.id === drawerState.candidateId)
      return candidate ? { type: 'history', candidate } : null
    }
    return {
      type: 'message',
      recipients: drawerState.candidateIds
        .map((id) => candidates.find((candidate) => candidate.id === id))
        .filter((candidate): candidate is Candidate => Boolean(candidate)),
    }
  }, [candidates, drawerState])

  const toggleCandidate = (candidateId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(candidateId)) next.delete(candidateId)
      else next.add(candidateId)
      return next
    })
  }

  const togglePageSelection = () => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (pageAllSelected) pageCandidates.forEach((candidate) => next.delete(candidate.id))
      else pageCandidates.forEach((candidate) => next.add(candidate.id))
      return next
    })
  }

  const updateSort = (key: ColumnKey) => {
    setSort((current) => current?.key === key
      ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: 'asc' })
  }

  const addCandidate = async (draft: CandidateDraft) => {
    if (!session) return
    setSavingCandidate(true)

    try {
      const created = await createCandidate(draft.name.trim(), draft.phone.trim(), 'not_sent', session.token)
      const candidate: Candidate = {
        id: created.candidateId,
        candidateId: created.candidateId,
        name: created.fullName,
        phone: created.phoneNumber,
        email: '',
        lastMessage: null,
        status: null,
        communications: [],
      }

      let refreshError = ''
      try {
        setCandidates(await fetchCandidates(session.token))
      } catch (error) {
        setCandidates((current) => [candidate, ...current.filter((item) => item.id !== candidate.id)])
        refreshError = error instanceof Error ? error.message : 'Could not refresh candidates.'
      }

      setCandidateDialogOpen(false)
      setPage(0)
      setToastSeverity(refreshError ? 'error' : 'success')
      setToast(refreshError
        ? `${created.fullName} was added, but the list could not be refreshed. ${refreshError}`
        : `${created.fullName} added successfully`)
    } catch (error) {
      setToastSeverity('error')
      setToast(error instanceof Error ? error.message : 'Could not add candidate.')
    } finally {
      setSavingCandidate(false)
    }
  }

  const deleteSelected = async () => {
    if (!session || selectedCandidates.length === 0) return
    setDeletingCandidates(true)

    try {
      const results = await Promise.all(selectedCandidates.map(async (candidate) => {
        try {
          const result = await deleteCandidate(candidate.graphqlId ?? candidate.id, session.token)
          if (!result.found) throw new Error(`The server could not find ${candidate.name}.`)
          return { id: candidate.id, success: true as const }
        } catch (error) {
          return {
            id: candidate.id,
            success: false as const,
            error: error instanceof Error ? error.message : `Could not delete ${candidate.name}.`,
          }
        }
      }))

      const deletedIds = new Set(results.filter((result) => result.success).map((result) => result.id))
      const failed = results.filter((result) => !result.success)
      setCandidates((current) => current.filter((candidate) => !deletedIds.has(candidate.id)))
      setSelectedIds((current) => new Set([...current].filter((id) => !deletedIds.has(id))))
      setDeleteDialogOpen(false)
      if (failed.length > 0) {
        const deletedCount = deletedIds.size
        setToastSeverity('error')
        setToast(`${deletedCount} of ${results.length} candidates deleted. ${failed[0].error}`)
      } else {
        setToastSeverity('success')
        setToast(results.length === 1 ? 'Candidate deleted successfully' : `${results.length} candidates deleted successfully`)
      }
    } finally {
      setDeletingCandidates(false)
    }
  }

  const openMessageDrawer = () => {
    setMessage('')
    setDrawerState({ type: 'message', candidateIds: selectedCandidates.map((candidate) => candidate.id) })
  }

  const sendMessage = async () => {
    if (!session || !message.trim() || drawerState?.type !== 'message') return
    const token = session.token
    const selectedCandidates = drawerState.candidateIds
      .map((id) => candidates.find((candidate) => candidate.id === id))
      .filter((candidate): candidate is Candidate => Boolean(candidate))
    const messageBody = message.trim()
    const parsedCandidateIds = selectedCandidates.map((candidate) => {
      const candidateId = Number(candidate.candidateId ?? candidate.id)
      return Number.isSafeInteger(candidateId) && candidateId > 0 ? candidateId : null
    })
    const invalidCandidate = selectedCandidates.find((_, index) => parsedCandidateIds[index] === null)

    if (invalidCandidate) {
      setToastSeverity('error')
      setToast(`${invalidCandidate.name} is not available on the server.`)
      return
    }

    const candidateIds = parsedCandidateIds as number[]
    let sentCount = 0
    let failedCount = 0
    let failureMessage = ''

    try {
      if (selectedCandidates.length === 1) {
        const result = await sendWhatsappMessage(
          candidateIds[0],
          'interview_invite',
          [selectedCandidates[0].name, messageBody],
          token,
        )
        sentCount = result.ok ? 1 : 0
        failedCount = result.ok ? 0 : 1
        failureMessage = result.error || ''
      } else {
        const result = await sendWhatsappBulk(candidateIds, 'hello_world', token)
        sentCount = result.successCount
        failedCount = result.failedCount
        failureMessage = result.results.find((item) => !item.ok)?.error || ''
      }
    } catch (error) {
      failedCount = selectedCandidates.length
      failureMessage = error instanceof Error ? error.message : 'Could not send WhatsApp message.'
    }

    let refreshError = ''
    try {
      setCandidates(await fetchCandidates(token))
    } catch (error) {
      refreshError = error instanceof Error ? error.message : 'Could not refresh candidates.'
    }

    setDrawerState(null)
    setMessage('')
    if (failedCount > 0) {
      setToastSeverity('error')
      setToast(`${failedCount} of ${selectedCandidates.length} messages failed. ${failureMessage}${refreshError ? ` ${refreshError}` : ''}`)
    } else if (refreshError) {
      setToastSeverity('error')
      setToast(`Messages sent, but candidate data could not be refreshed. ${refreshError}`)
    } else {
      setToastSeverity('success')
      setToast(`Message sent to ${sentCount} ${sentCount === 1 ? 'candidate' : 'candidates'}`)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  if (!session) return <LoginPage onLogin={handleLogin} />

  return (
    <div className="app-shell flex min-h-screen flex-col bg-[#f5f5f5]">
      <header className="topbar flex min-h-[72px] items-center justify-between gap-5 bg-white px-6">
        <h1 className="shrink-0 text-2xl font-semibold tracking-tight text-black">Candidate communication</h1>
        <div className="topbar-actions flex items-center gap-2">
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setCandidateDialogOpen(true)}
            className="!h-9 !whitespace-nowrap !px-3 !text-sm"
          >
            Add Candidate
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DeleteOutline />}
            disabled={selectedCandidates.length === 0}
            onClick={() => setDeleteDialogOpen(true)}
            className="!h-9 !whitespace-nowrap !px-3 !text-sm"
          >
            Delete Candidate
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            disabled={selectedCandidates.length === 0}
            onClick={openMessageDrawer}
            className="!h-9 !whitespace-nowrap !px-3 !text-sm"
          >
            Send Message
          </Button>
          <TextField
            placeholder="Search"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            size="small"
            className="search-input"
            inputProps={{ 'aria-label': 'Search candidates' }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
          />
          {/* <span className="auth-user" title={session.user.email}>
            {session.user.username || session.user.email}
          </span> */}
          <Button
            variant="text"
            color="inherit"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            className="!h-9 !whitespace-nowrap !px-3 !text-sm"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="candidate-panel flex min-h-0 flex-1 flex-col">
        <div className="table-scroll relative min-h-0 flex-1 overflow-auto">
          <table className="candidate-table w-full border-collapse text-left">
            <colgroup>
              <col className="select-column" />
              <col className="name-column" />
              <col className="phone-column" />
              <col className="date-column" />
              <col className="status-column" />
              <col className="id-column" />
            </colgroup>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <Checkbox
                    size="small"
                    checked={pageAllSelected}
                    indeterminate={!pageAllSelected && pageCandidates.some((candidate) => selectedIds.has(candidate.id))}
                    onChange={togglePageSelection}
                    inputProps={{ 'aria-label': 'Select all candidates on this page' }}
                  />
                </th>
                {columns.map((column) => (
                  <th key={column.key}>
                    <div className="column-heading">
                      <button className="column-sort" onClick={() => updateSort(column.key)}>
                        {column.label}
                        {sort?.key === column.key && (
                          sort.direction === 'asc'
                            ? <ArrowUpward className="sort-indicator" />
                            : <ArrowDownward className="sort-indicator" />
                        )}
                      </button>
                      <IconButton
                        aria-label={`Filter or sort ${column.label}`}
                        size="small"
                        onClick={(event) => setFilterMenu({ element: event.currentTarget, key: column.key })}
                        className="!p-1"
                      >
                        <FilterList className="!text-[16px]" />
                      </IconButton>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageCandidates.map((candidate) => {
                const selected = selectedIds.has(candidate.id)
                return (
                  <tr key={candidate.id} className={selected ? 'candidate-row selected-row' : 'candidate-row'}>
                    <td className="checkbox-cell">
                      <Checkbox
                        size="small"
                        checked={selected}
                        onChange={() => toggleCandidate(candidate.id)}
                        inputProps={{ 'aria-label': `Select ${candidate.name}` }}
                      />
                    </td>
                    <td>
                      <button className="candidate-name" onClick={() => setDrawerState({ type: 'history', candidateId: candidate.id })}>
                        {candidate.name}
                      </button>
                    </td>
                    <td>{candidate.phone}</td>
                    <td className={!candidate.lastMessage ? 'muted-cell' : ''}>{candidate.lastMessage ?? 'NA'}</td>
                    <td><StatusBadge status={candidate.status} /></td>
                    <td>{candidate.id}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {loadingCandidates ? (
            <div aria-hidden="true" className="table-filler" />
          ) : candidates.length === 0 ? (
            <div className="empty-table-state"><EmptyState kind="candidates" /></div>
          ) : filteredCandidates.length === 0 ? (
            <div className="no-results-state">No candidates found</div>
          ) : (
            <div aria-hidden="true" className="table-filler" />
          )}
        </div>

        <footer className="table-pagination flex h-[50px] shrink-0 items-center gap-7 px-4">
          <label className="flex items-center gap-2 whitespace-nowrap text-sm">
            Rows per page:
            <select
              value={rowsPerPage}
              onChange={(event) => {
                setRowsPerPage(Number(event.target.value))
                setPage(0)
              }}
              aria-label="Rows per page"
              className="rows-select"
            >
              {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <span className="whitespace-nowrap text-sm">
            {filteredCandidates.length === 0 ? '0-0 of 0' : `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredCandidates.length)} of ${filteredCandidates.length}`}
          </span>
          <div className="flex items-center text-slate-400">
            <IconButton size="small" disabled={page === 0} onClick={() => setPage(0)} aria-label="First page"><FirstPage /></IconButton>
            <IconButton size="small" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} aria-label="Previous page"><ChevronLeft /></IconButton>
            <IconButton size="small" disabled={page >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} aria-label="Next page"><ChevronRight /></IconButton>
            <IconButton size="small" disabled={page >= pageCount - 1} onClick={() => setPage(pageCount - 1)} aria-label="Last page"><LastPage /></IconButton>
          </div>
        </footer>
      </main>

      <Menu
        anchorEl={filterMenu?.element}
        open={Boolean(filterMenu)}
        onClose={() => setFilterMenu(null)}
      >
        {filterMenu?.key === 'status' ? (
          <>
            <MenuItem selected={statusFilter === 'all'} onClick={() => { setStatusFilter('all'); setPage(0); setFilterMenu(null) }}>All statuses</MenuItem>
            <MenuItem selected={statusFilter === 'read'} onClick={() => { setStatusFilter('read'); setPage(0); setFilterMenu(null) }}>Read</MenuItem>
            <MenuItem selected={statusFilter === 'failed'} onClick={() => { setStatusFilter('failed'); setPage(0); setFilterMenu(null) }}>Failed</MenuItem>
            <MenuItem selected={statusFilter === 'sent'} onClick={() => { setStatusFilter('sent'); setPage(0); setFilterMenu(null) }}>Sent</MenuItem>
            <MenuItem selected={statusFilter === 'none'} onClick={() => { setStatusFilter('none'); setPage(0); setFilterMenu(null) }}>Not contacted</MenuItem>
          </>
        ) : filterMenu ? (
          <>
            <MenuItem onClick={() => { setSort({ key: filterMenu.key, direction: 'asc' }); setFilterMenu(null) }}>Sort ascending</MenuItem>
            <MenuItem onClick={() => { setSort({ key: filterMenu.key, direction: 'desc' }); setFilterMenu(null) }}>Sort descending</MenuItem>
            <MenuItem onClick={() => { setSort(null); setFilterMenu(null) }}>Clear sorting</MenuItem>
          </>
        ) : null}
      </Menu>

      <CandidateDialog
        open={candidateDialogOpen}
        saving={savingCandidate}
        onClose={() => setCandidateDialogOpen(false)}
        onSave={addCandidate}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        names={selectedCandidates.map((candidate) => candidate.name)}
        deleting={deletingCandidates}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={deleteSelected}
      />
      <CommunicationDrawer
        content={drawerContent}
        message={message}
        onMessageChange={setMessage}
        onClose={() => setDrawerState(null)}
        onSend={sendMessage}
      />
      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert
          icon={toastSeverity === 'success' ? <CheckCircleOutline /> : undefined}
          severity={toastSeverity}
          onClose={() => setToast('')}
          className={toastSeverity === 'success' ? 'success-toast' : undefined}
        >
          {toast}
        </Alert>
      </Snackbar>
    </div>
  )
}
