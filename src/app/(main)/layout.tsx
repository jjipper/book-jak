import BottomNav from '@/widgets/bottom-nav/BottomNav'
import AuthProvider from '@/widgets/auth-provider/AuthProvider'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="pb-nav">
        {children}
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
