import { createHashRouter } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProtectedItemsPage } from "@/pages/ProtectedItemsPage";
import { IncidentsPage } from "@/pages/IncidentsPage";
import { CameraPage } from "@/pages/CameraPage";
import { TerminalPage } from "@/pages/TerminalPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SessionsPage } from "@/pages/SessionsPage";
import { UnlockMethodsPage } from "@/pages/UnlockMethodsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "protected-items", element: <ProtectedItemsPage /> },
      { path: "incidents", element: <IncidentsPage /> },
      { path: "camera", element: <CameraPage /> },
      { path: "terminal", element: <TerminalPage /> },
      { path: "sessions", element: <SessionsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "settings/unlock-methods", element: <UnlockMethodsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
