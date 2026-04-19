import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // not logged in → send to landing page
    return <Navigate to="/landing" replace />;
  }

  // Read onboarding status from localStorage directly — no need to wait for Supabase.
  // This avoids the timing problem where ProtectedRoute renders before statsLoaded.
  const localOnboarding = localStorage.getItem(`sq_${user.id}_onboarding_completed`);
  const localLevel = Number(localStorage.getItem(`sq_${user.id}_level`) || "0");
  const localTotalSteps = Number(localStorage.getItem(`sq_${user.id}_total_steps`) || "0");

  // Consider onboarding complete if:
  //   - the flag is explicitly set to "true"  OR
  //   - they have already chosen a hero class (non-null in localStorage) OR
  //   - they are an existing user with ANY progress (level > 1 or some steps)
  const localHeroClass = localStorage.getItem(`sq_${user.id}_hero_class`);
  
  const isOnboardingDone =
    localOnboarding === "true" || 
    (localHeroClass && localHeroClass !== "null") ||
    localLevel > 1 || 
    localTotalSteps > 10;

  // Whitelist /settings so users can ALWAYS log out if they are stuck
  const isWhitelisted = location.pathname === "/onboarding" || location.pathname === "/settings";

  if (!isOnboardingDone && !isWhitelisted) {
    return <Navigate to="/onboarding" replace />;
  }

  // Prevent re-visiting onboarding once done
  if (isOnboardingDone && location.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return children;
}
