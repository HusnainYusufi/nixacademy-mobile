import { CreditCard } from 'lucide-react';
import { Placeholder } from '@/screens/Placeholder';

export function CheckoutScreen() {
  return <Placeholder title="إتمام الشراء" back icon={<CreditCard className="size-7" />} />;
}
