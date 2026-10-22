'use client'

import { useState, useSyncExternalStore } from 'react'
import Icon from './Icon'
import IconButton from './IconButton'
import ConfirmSheet from './ConfirmSheet'

/* 탭 상단 "?" — 눌러서 보는 기능 안내 (Figma 3-1e).
   캡션 대신 쓴다: 첫 방문엔 한 번 자동으로 열리고, "다시 보지 않기"를 누르면 다시 안 뜬다. */

interface PageHelpProps {
  /** localStorage 키 꼬리 (탭별로 다르게) */
  id: string
  title: string
  description: string
}

const key = (id: string) => `bj_help_dismissed_${id}`

// "다시 보지 않기" 여부는 localStorage가 원본 — 서버 렌더에선 '본 것'으로 쳐서 깜빡임을 막는다
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }
const isDismissed = (id: string) => { try { return localStorage.getItem(key(id)) !== null } catch { return true } }

export default function PageHelp({ id, title, description }: PageHelpProps) {
  const dismissed = useSyncExternalStore(subscribe, () => isDismissed(id), () => true)
  const [closed, setClosed] = useState(false)   // 이번 방문에서 "알겠어요"로 닫음
  const [manual, setManual] = useState(false)   // ? 버튼으로 다시 엶
  const open = manual || (!dismissed && !closed)

  function close() { setManual(false); setClosed(true) }
  function dismissForever() {
    try { localStorage.setItem(key(id), '1') } catch {}
    listeners.forEach((fn) => fn())
    close()
  }

  return (
    <>
      <IconButton label="기능 안내" onClick={() => setManual(true)}>
        <Icon name="help" size={24} />
      </IconButton>
      <ConfirmSheet
        open={open}
        message={title}
        description={description}
        confirmLabel="알겠어요"
        cancelLabel="다시 보지 않기"
        onConfirm={close}
        onCancel={dismissForever}
      />
    </>
  )
}
