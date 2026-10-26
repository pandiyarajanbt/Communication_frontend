# Candidate communication platform

A responsive React interface for managing candidate records and communication history.

## Stack

- React and TypeScript with Vite
- Tailwind CSS
- Material UI

## Run locally

```sh
npm install
npm run dev
```

Sign-in, candidate listing, and WhatsApp messages use GraphQL at `http://127.0.0.1:8000/graphql/`. Query and mutation documents are in `src/graphql/operations`. Set `VITE_GRAPHQL_ENDPOINT` in a local `.env` file to use another endpoint. The returned token is sent as a bearer token for candidate and message requests; it and the user are stored in browser local storage, and an expired JWT returns the app to the sign-in screen. Candidate add and delete remain client-side because no corresponding backend operations were provided.

## Environment variables

Copy `.env.example` to `.env` and fill in the values before running locally.

| Variable                | Default                          | Description                        |
| ----------------------- | -------------------------------- | ---------------------------------- |
| `VITE_GRAPHQL_ENDPOINT` | `http://127.0.0.1:8000/graphql/` | GraphQL API endpoint               |

## Project structure

```
src/
├── main.tsx                     # MUI theme setup and ReactDOM entry
├── App.tsx                      # Root component — owns all state and logic
├── types.ts                     # Shared types: Candidate, Communication, MessageStatus
├── styles.css                   # Global and Tailwind styles
├── components/
│   ├── LoginPage.tsx            # Sign-in form
│   ├── CandidateDialog.tsx      # Add candidate modal
│   ├── DeleteDialog.tsx         # Delete confirmation modal
│   ├── CommunicationDrawer.tsx  # Message history and compose drawer
│   ├── StatusBadge.tsx          # read / sent / failed status chip
│   └── EmptyState.tsx           # Empty table placeholder
└── graphql/
    ├── client.ts                # GraphQL fetch, login, JWT decode, session storage
    ├── candidates.ts            # Candidate and WhatsApp operation functions
    └── operations/              # Raw .gql query and mutation documents
        ├── candidates.gql
        ├── createCandidate.gql
        ├── deleteCandidate.gql
        ├── loginUser.gql
        ├── sendWhatsappMessage.gql
        └── sendWhatsappBulk.gql
```

## Data and state flow

All application state lives in `App.tsx`:

- **Session** — stored in `localStorage` via `src/graphql/client.ts`. The JWT is decoded client-side to schedule an automatic logout on expiry.
- **Candidates** — fetched on login, refreshed after add/delete/send. Filtered, sorted, and paginated entirely in the browser.
- **CandidateDialog** — calls `createCandidate` GraphQL mutation, then refreshes the list.
- **DeleteDialog** — calls `deleteCandidate` GraphQL mutation for each selected candidate in parallel.
- **CommunicationDrawer** — shows message history for a single candidate, or a compose view that calls `sendWhatsappMessage` (single) or `sendWhatsappBulk` (multiple).
