import { Routes, Route } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/admin/DashboardPage'
import ProductosPage from '@/pages/admin/ProductosPage'
import CategoriasPage from '@/pages/admin/CategoriasPage'
import ProveedoresPage from '@/pages/admin/ProveedoresPage'
import MovimientosPage from '@/pages/admin/MovimientosPage'
import EmpleadoEntradaPage from '@/pages/empleado/EntradaPage'
import EmpleadoSalidaPage from '@/pages/empleado/SalidaPage'
import EmpleadoMovimientosPage from '@/pages/empleado/MovimientosPage'
import EmpleadoPanelPage from '@/pages/empleado/PanelPage'
import EmpleadoStockPage from '@/pages/empleado/StockPage'
import UsuariosPage from '@/pages/admin/UsuariosPage'
import ReportesPage from '@/pages/admin/ReportesPage'
import ConfigPage from '@/pages/admin/ConfigPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="movimientos" element={<MovimientosPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="configuracion" element={<ConfigPage />} />
      </Route>

      <Route
        path="/empleado"
        element={
          <ProtectedRoute allowedRoles={['empleado']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmpleadoPanelPage />} />
        <Route path="panel" element={<EmpleadoPanelPage />} />
        <Route path="stock" element={<EmpleadoStockPage />} />
        <Route path="entrada" element={<EmpleadoEntradaPage />} />
        <Route path="salida" element={<EmpleadoSalidaPage />} />
        <Route path="movimientos" element={<EmpleadoMovimientosPage />} />
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  )
}


