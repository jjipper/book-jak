import BottomNav from '@/widgets/bottom-nav/BottomNav'
import AuthProvider from '@/widgets/auth-provider/AuthProvider'
import ToastContainer from '@/shared/ui/Toast'
import TopActions from '@/shared/ui/TopActions'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="pb-nav">
        <TopActions />
        {children}
        <BottomNav />
      </div>
      <ToastContainer />
    </AuthProvider>
  )
}
