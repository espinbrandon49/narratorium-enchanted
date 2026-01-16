import { BrowserRouter } from "react-router-dom";
import AppShell from "./app/AppShell";
import Routes from "./app/routes";
import { AuthProvider } from "./hooks/useAuth";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <Routes />
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  );
}
