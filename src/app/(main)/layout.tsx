import BottomNav from '@/widgets/bottom-nav/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-nav">
      {children}
      <BottomNav />
    </div>
  )
}
