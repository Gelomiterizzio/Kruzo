'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { AppUser } from '@/lib/types/user'
import { getInitials, formatRelativeTime } from '@/lib/utils/formatters'
import { Shield, Ban, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

type PendingAction =
  | { kind: 'ban'; user: AppUser }
  | { kind: 'make-admin'; user: AppUser }
  | null

const ROLE_CFG: Record<string, { label: string; cls: string }> = {
  admin: { label: 'Admin',   cls: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' },
  user:  { label: 'Usuario', cls: 'bg-muted text-muted-foreground' },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingAction>(null)

  useEffect(() => {
    getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100)))
      .then(snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser))))
      .catch(() => toast.error('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [])

  const setRole = async (uid: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role })
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: role as AppUser['role'] } : u))
      toast.success('Rol actualizado')
    } catch { toast.error('Error al actualizar') }
  }

  const toggleBan = async (uid: string, banned: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isBanned: !banned })
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, isBanned: !banned } : u))
      toast.success(!banned ? 'Usuario suspendido' : 'Usuario reactivado')
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Shield size={22} /> Usuarios</h1>
        <p className="text-muted-foreground text-sm">{users.length} usuarios registrados</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {users.map(u => {
            const cfg = ROLE_CFG[u.role] ?? ROLE_CFG.user
            return (
              <div key={u.id} className={`flex items-center gap-3 p-3 bg-card border rounded-2xl transition-all ${u.isBanned ? 'opacity-50 border-destructive/30' : 'border-border'}`}>
                {u.photoURL
                  ? <img src={u.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  : <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{getInitials(u.displayName || 'U')}</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{u.displayName || '(sin nombre)'}</p>
                    {u.isBanned && <span className="text-xs text-destructive font-medium">BANEADO</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email} · {u.businessIds?.length ?? 0} negocios · {formatRelativeTime(u.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                  <select value={u.role === 'admin' ? 'admin' : 'user'} aria-label={`Rol de ${u.displayName || u.email}`}
                    onChange={e => {
                      // Granting admin is the most sensitive action — confirm it.
                      if (e.target.value === 'admin') setPending({ kind: 'make-admin', user: u })
                      else setRole(u.id, e.target.value)
                    }}
                    className="text-xs px-2 py-1 border border-border rounded-lg bg-background">
                    <option value="user">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => u.isBanned ? toggleBan(u.id, true) : setPending({ kind: 'ban', user: u })}
                    className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'bg-green-100 dark:bg-green-950 text-green-600' : 'hover:bg-red-100 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600'}`}
                    title={u.isBanned ? 'Reactivar' : 'Suspender'}>
                    {u.isBanned ? <CheckCircle size={14} /> : <Ban size={14} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!pending}
        title={pending?.kind === 'make-admin' ? '¿Dar permisos de administrador?' : '¿Suspender a este usuario?'}
        description={
          pending?.kind === 'make-admin'
            ? `${pending.user.displayName || pending.user.email} tendrá control total de la plataforma (negocios, usuarios, reportes).`
            : pending
              ? `${pending.user.displayName || pending.user.email} no podrá iniciar sesión ni usar su cuenta.`
              : ''
        }
        confirmLabel={pending?.kind === 'make-admin' ? 'Dar admin' : 'Suspender'}
        variant="danger"
        onConfirm={() => {
          if (pending?.kind === 'make-admin') setRole(pending.user.id, 'admin')
          if (pending?.kind === 'ban') toggleBan(pending.user.id, false)
          setPending(null)
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
