import SocialHubView from '@/views/social-hub/ui/SocialHubView'

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  return <SocialHubView initialTab={tab === 'recommend' ? 'recommend' : 'clubs'} />
}
