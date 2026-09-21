import AuthProvider from '@/widgets/auth-provider/AuthProvider'
import ToastContainer from '@/shared/ui/Toast'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer />
    </AuthProvider>
  )
}
