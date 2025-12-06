import { JoinHousehold } from '@/components/household/JoinHousehold'

export default function JoinPage({ params }: { params: { token: string } }) {
  return <JoinHousehold token={params.token} />
}
