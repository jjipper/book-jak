import BottomNav from '@/widgets/bottom-nav/BottomNav'
import AuthProvider from '@/widgets/auth-provider/AuthProvider'
import ToastContainer from '@/shared/ui/Toast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="pb-nav">
        {children}
        <BottomNav />
      </div>
      <ToastContainer />
    </AuthProvider>
  )
}
