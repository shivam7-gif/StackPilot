'use client'

import { useCursor } from '@/hooks/useCursor'
import styles from './Cursor.module.css'

export default function Cursor() {
  const cursorRef = useCursor()

  return (
    <div ref={cursorRef} className={styles.cursor}>
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="white" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    </div>
  )
}