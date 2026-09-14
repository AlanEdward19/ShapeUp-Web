# Import patch — T14 Onboarding

Apply in `src/App.jsx`:

```diff
-import Onboarding from './stitch/Onboarding';
+import Onboarding from './pages/Dashboard/OnboardingShell';
```

Route unchanged: `/dashboard/onboarding` still renders `<Onboarding />` inside `ProtectedRoute`.
