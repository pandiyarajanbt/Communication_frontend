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
