'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Heart, Menu, X, Plus, ChevronDown,
  LogOut, Settings, LayoutDashboard, Shield,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useStore } from '@/lib/store/useStore'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { CommandPalette } from '@/components/search/CommandPalette'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils/cn'
import { getInitials } from '@/lib/utils/formatters'
import { getUnreadNotificationsCount } from '@/lib/firebase/firestore'

const NAV_LINKS = [
  { href: '/explore',  label: 'Explorar' },
  { href: '/trending', label: 'Tendencias' },
  { href: '/search',   label: 'Buscar' },
]

export function Navbar() {
  const pathname   = usePathname()
  const router     = useRouter()
  const { user, signOut, isEntrepreneur, isAdmin } = useAuth()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useStore()
  const [scrolled, setScrolled]       = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchVal, setSearchVal]     = useState('')
  const [cmdOpen, setCmdOpen]         = useState(false)
  const [isMac, setIsMac]             = useState(false)

  // Real unread count — the bell only lights up when something is actually unread.
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread', user?.id],
    enabled: !!user,
    queryFn: () => getUnreadNotificationsCount(user!.id),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Show the right modifier hint per platform (⌘ on Mac, Ctrl elsewhere).
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent))
  }, [])

  // ⌘K / Ctrl+K opens the command palette from anywhere.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname, setIsMobileMenuOpen])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-user-menu]')) setUserMenuOpen(false)
    }
    if (userMenuOpen) document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [userMenuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`)
      setSearchVal('')
    }
  }

  return (
    <>
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-background/95 backdrop-blur-xl shadow-warm-sm border-b border-border/50'
          : 'bg-transparent',
      )}
    >
      <nav className="container flex h-16 items-center gap-3">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 font-display font-black text-xl shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-sm font-black select-none transition-shadow group-hover:shadow-glow-sm">
            K
          </div>
          <span className="text-gradient hidden sm:block tracking-tight">KRUZO</span>
        </Link>

        {/* ── Command palette trigger ── */}
        <button
          onClick={() => setCmdOpen(true)}
          aria-label="Búsqueda rápida"
          className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-3 py-2 text-sm bg-muted/60 rounded-xl border border-border/40 text-muted-foreground/70 hover:bg-muted hover:border-border transition-all group"
        >
          <Search size={14} className="transition-colors group-hover:text-primary" />
          <span className="flex-1 text-left">Buscar negocio, servicio…</span>
          <kbd className="text-[10px] font-medium border border-border/70 rounded-md px-1.5 py-0.5 leading-none">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>

        {/* ── Desktop nav links ── */}
        <div className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => {
            const active = pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* ── Right side ── */}
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          {user ? (
            <>
              {(isEntrepreneur || isAdmin) && (
                <Link
                  href="/dashboard/posts/new"
                  className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:flex')}
                >
                  <Plus size={15} /> Publicar
                </Link>
              )}

              <Link
                href="/favorites"
                aria-label="Favoritos"
                className={cn('p-2 rounded-xl transition-colors', pathname === '/favorites' ? 'bg-accent' : 'hover:bg-accent/70')}
              >
                <Heart size={19} className={pathname === '/favorites' ? 'fill-red-500 text-red-500' : ''} />
              </Link>

              <Link
                href="/notifications"
                aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount} sin leer)` : 'Notificaciones'}
                className={cn('p-2 rounded-xl transition-colors relative', pathname === '/notifications' ? 'bg-accent' : 'hover:bg-accent/70')}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative" data-user-menu>
                <button
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen) }}
                  aria-label="Menú de usuario"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-accent/70 transition-colors"
                >
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt="" width={32} height={32} className="w-8 h-8 rounded-xl object-cover ring-2 ring-border" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                      {getInitials(user.displayName || 'U')}
                    </div>
                  )}
                  <ChevronDown
                    size={12}
                    className={cn('text-muted-foreground hidden sm:block transition-transform duration-200', userMenuOpen && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-warm-lg p-1.5 z-50"
                    >
                      <div className="px-3 py-2.5 border-b border-border/50 mb-1.5">
                        <p className="text-sm font-bold truncate">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>

                      {(isEntrepreneur || isAdmin) && (
                        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-accent/70 transition-colors">
                          <LayoutDashboard size={14} className="text-muted-foreground" /> Panel de control
                        </Link>
                      )}
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-primary/10 transition-colors text-primary font-medium">
                          <Shield size={14} /> Administración
                        </Link>
                      )}
                      <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-accent/70 transition-colors">
                        <Settings size={14} className="text-muted-foreground" /> Configuración
                      </Link>

                      <div className="border-t border-border/50 mt-1.5 pt-1.5">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false) }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-destructive/10 text-destructive w-full transition-colors"
                        >
                          <LogOut size={14} /> Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:flex')}>
                Entrar
              </Link>
              <Link href="/register" className={buttonVariants({ size: 'sm' })}>
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-accent/70 transition-colors"
            aria-label="Menú"
            aria-expanded={isMobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-border/50 bg-background/95 backdrop-blur-xl lg:hidden overflow-hidden"
          >
            <div className="container py-4 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={14} />
                  <input
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Buscar…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/60 rounded-xl border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </form>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    pathname.startsWith(l.href)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-accent/70 text-foreground',
                  )}
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href="/favorites" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm hover:bg-accent/70">
                    <Heart size={15} className="text-muted-foreground" /> Favoritos
                  </Link>
                  <Link href="/notifications" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm hover:bg-accent/70">
                    <span className="relative">
                      <Bell size={15} className="text-muted-foreground" />
                      {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />}
                    </span>
                    Notificaciones
                  </Link>
                  {(isEntrepreneur || isAdmin) && (
                    <Link href="/dashboard/posts/new" className={cn(buttonVariants({ size: 'md' }), 'w-full mt-1')}>
                      <Plus size={15} /> Nueva publicación
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/register" className={cn(buttonVariants({ size: 'md' }), 'w-full mt-1')}>
                  Crear cuenta gratis
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  )
}
