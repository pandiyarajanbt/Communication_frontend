import type { Candidate } from '../types'

const sampleHistory = (
  name: string,
  firstDate: string,
): Candidate['communications'] => [
  {
    id: `${name}-latest`,
    sentAt: firstDate,
    body: 'This is a test message.',
    status: 'sent',
  },
  {
    id: `${name}-older-1`,
    sentAt: '23-10-2026 10:47 AM',
    body: 'Great ideas often begin with simple observations. Creativity grows when we explore new perspectives and challenge familiar ways of thinking. Every small step brings us closer to meaningful progress. The key is to stay curious, embrace change, and keep moving forward.',
    status: 'read',
  },
  {
    id: `${name}-older-2`,
    sentAt: '19-09-2026 10:00 PM',
    body: 'The world is full of possibilities waiting to be explored. Every day brings new opportunities to learn, grow, and discover something unexpected. Sometimes, the smallest moments leave the biggest impressions on our lives. What truly matters is how we choose to make the most of them.',
    status: 'read',
  },
  {
    id: `${name}-older-3`,
    sentAt: '12-09-2026 10:00 PM',
    body: 'Every new experience brings an opportunity to learn something valuable. Even the smallest steps can lead to meaningful changes over time.',
    status: 'read',
  },
]

export const initialCandidates: Candidate[] = [
  {
    id: 'A1B2C3',
    name: 'Krishna Khandelwal',
    phone: '+91 9876543210',
    email: 'krishna.khandelwal@gmail.com',
    lastMessage: '12-10-2026',
    status: 'read',
    communications: sampleHistory('krishna', '25-10-2026 9:47 AM'),
  },
  {
    id: 'D4E5F6',
    name: 'Urvashi Soni',
    phone: '+91 9123456789',
    email: 'urvashi.soni@gmail.com',
    lastMessage: '15-10-2026',
    status: 'failed',
    communications: [
      {
        id: 'urvashi-latest',
        sentAt: '15-10-2026 11:30 AM',
        body: 'We were unable to deliver this message. Please check the contact details and try again.',
        status: 'failed',
      },
    ],
  },
  {
    id: 'G7H8I9',
    name: 'Aditya Kumar',
    phone: '+91 9988766554',
    email: 'aditya.kumar@gmail.com',
    lastMessage: '18-10-2026',
    status: 'read',
    communications: sampleHistory('aditya', '18-10-2026 10:15 AM'),
  },
  {
    id: 'J1K2L3',
    name: 'Ajit Srivastava',
    phone: '+91 9234567890',
    email: 'ajit.srivastava@gmail.com',
    lastMessage: '21-10-2026',
    status: 'read',
    communications: sampleHistory('ajit', '21-10-2026 2:30 PM'),
  },
  {
    id: 'M4N5O6',
    name: 'Aniket Sawant',
    phone: '+91 9876512345',
    email: 'aniket.sawant@gmail.com',
    lastMessage: '24-10-2026',
    status: 'sent',
    communications: [
      {
        id: 'aniket-latest',
        sentAt: '24-10-2026 1:18 PM',
        body: 'Thank you for your interest. We will be in touch with you soon.',
        status: 'sent',
      },
    ],
  },
  {
    id: 'P7Q8R9',
    name: 'Ira Akbar',
    phone: '+91 9456789012',
    email: 'ira.akbar@gmail.com',
    lastMessage: null,
    status: null,
    communications: [],
  },
  {
    id: 'S1T2U3',
    name: 'Amarjeet Kumar',
    phone: '+91 9012345678',
    email: 'amarjeet.kumar@gmail.com',
    lastMessage: null,
    status: null,
    communications: [],
  },
]
