import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// AdminPage is deprecated — redirect to dashboard.
// Staff management moved to /staff-manage, checkpoints to /checkpoints.
export default function AdminPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/dashboard', { replace: true })
  }, [navigate])
  return null
}
