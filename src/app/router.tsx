import { createHashRouter } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProtectedItemsPage } from "@/pages/ProtectedItemsPage";
import { IncidentsPage } from "@/pages/IncidentsPage";
import { CameraPage } from "@/pages/CameraPage";
import { SettingsPage } from "@/pages/SettingsPage";
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
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
