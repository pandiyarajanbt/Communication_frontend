type EmptyStateProps = {
  kind: 'candidates' | 'history'
}

function EmptyIllustration() {
  return (
    <svg aria-hidden="true" className="empty-illustration" viewBox="0 0 230 165" fill="none">
      <path d="m20 105 81-43 61 32-81 44-61-33Z" fill="#BDD9F2" stroke="#7893AA" />
      <path d="m81 138 81-44v7l-81 45v-8Z" fill="#34495E" />
      <path d="m31 105 65-35m-54 45 51-27m-36 36 47-25" stroke="#7EA4C5" strokeWidth="2" />
      <path d="m61 85 27-15 22 12-27 15-22-12Z" fill="white" stroke="#7995AC" />
      <circle cx="87" cy="80" r="6" fill="#55A8F3" />
      <path d="m121 80 22-12 30 15-22 13-30-16Z" fill="#EAF5FF" stroke="#8DA6BA" />
      <path d="m157 96 26-15 23 11-26 16-23-12Z" fill="#55A8F3" stroke="#54718A" />
      <path d="m174 105 26-15v7l-26 16v-8Z" fill="#34495E" />
      <path d="M151 39c-5 11-4 27 1 38h37c5-11 6-27 1-38l-19-19-20 19Z" fill="#fff" stroke="#8294A3" />
      <path d="M152 48c-14-8-13-23-6-34 7 6 10 13 11 20 1-17 9-28 16-34 8 10 12 21 11 34 3-9 8-14 14-18 5 13 3 25-8 33-8 6-29 6-38-1Z" fill="#65AEF1" stroke="#457EA9" />
      <path d="M150 79c11 7 30 8 41 0" stroke="#BBC6CF" />
      <circle cx="151" cy="79" r="2" fill="#34495E" />
      <circle cx="190" cy="79" r="2" fill="#34495E" />
      <circle cx="151" cy="82" r="1.5" fill="#34495E" />
      <circle cx="190" cy="82" r="1.5" fill="#34495E" />
      <circle cx="178" cy="123" r="17" fill="white" stroke="#34495E" strokeWidth="4" />
      <circle cx="178" cy="123" r="12" stroke="#55A8F3" strokeWidth="2" />
      <path d="m166 136-26 18" stroke="#34495E" strokeWidth="6" strokeLinecap="round" />
      <path d="m164 137-24 16" stroke="#55A8F3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function EmptyState({ kind }: EmptyStateProps) {
  if (kind === 'history') {
    return (
      <div className="flex flex-col items-center justify-center px-8 text-center">
        <EmptyIllustration />
        <h3 className="mt-5 text-lg font-semibold">No communication history</h3>
        <p className="mt-1 max-w-[380px] text-base leading-5 text-slate-700">
          You have not communicated with this candidate yet. When you send them a message, it will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="empty-candidates flex h-full flex-col items-center justify-center px-8 text-center">
      <EmptyIllustration />
      <h2 className="mt-7 text-lg font-semibold">No candidates added</h2>
      <p className="mt-1 text-base text-slate-700">When you add a candidate, they will appear here.</p>
    </div>
  )
}
