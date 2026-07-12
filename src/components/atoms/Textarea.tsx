import type { TextareaHTMLAttributes } from 'react'

/* 10b. TEXTAREA — 자유 텍스트 입력 (질문·답변·모임 폼) */

export default function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={['bj-textarea', className].filter(Boolean).join(' ')} {...rest} />
}
