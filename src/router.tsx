import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { BootSplash } from '@/screens/BootSplash';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { StudentShell } from '@/components/layout/StudentShell';
import { PlainShell } from '@/components/layout/PlainShell';
import { ExploreScreen } from '@/screens/student/ExploreScreen';
import { LearningScreen } from '@/screens/student/LearningScreen';
import { CartScreen } from '@/screens/student/CartScreen';
import { ProfileScreen } from '@/screens/student/ProfileScreen';
import { CourseDetailScreen } from '@/screens/student/CourseDetailScreen';
import { CheckoutScreen } from '@/screens/student/CheckoutScreen';
import { PlayerScreen } from '@/screens/student/PlayerScreen';

/** Route tree. Auth state decides whether the app or the login screen renders. */
export function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <BootSplash />;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/app" element={<StudentShell />}>
        <Route index element={<Navigate to="/app/explore" replace />} />
        <Route path="explore" element={<ExploreScreen />} />
        <Route path="learning" element={<LearningScreen />} />
        <Route path="cart" element={<CartScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
      </Route>
      <Route element={<PlainShell />}>
        <Route path="/course/:id" element={<CourseDetailScreen />} />
        <Route path="/checkout" element={<CheckoutScreen />} />
        <Route path="/learn/:courseId" element={<PlayerScreen />} />
      </Route>
      <Route path="/login" element={<Navigate to="/app/explore" replace />} />
      <Route path="*" element={<Navigate to="/app/explore" replace />} />
    </Routes>
  );
}
