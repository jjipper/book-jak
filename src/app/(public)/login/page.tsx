import { Suspense } from 'react'
import LoginView from '@/views/login/ui/LoginView'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  )
}
