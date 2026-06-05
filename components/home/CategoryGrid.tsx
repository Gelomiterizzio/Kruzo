'use client'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'

const CATS = [
  { key: 'comida',        emoji: '🍕', label: 'Comida',        gradient: 'from-orange-500 to-red-500'     },
  { key: 'reposteria',    emoji: '🧁', label: 'Repostería',    gradient: 'from-pink-500 to-rose-500'      },
  { key: 'tecnologia',    emoji: '💻', label: 'Tecnología',    gradient: 'from-blue-600 to-indigo-600'    },
  { key: 'belleza',       emoji: '💇', label: 'Belleza',       gradient: 'from-fuchsia-500 to-pink-500'   },
  { key: 'ropa',          emoji: '👗', label: 'Ropa',          gradient: 'from-violet-600 to-purple-600'  },
  { key: 'servicios',     emoji: '🔧', label: 'Servicios',     gradient: 'from-teal-500 to-cyan-500'      },
  { key: 'fotografia',    emoji: '📸', label: 'Fotografía',    gradient: 'from-indigo-600 to-blue-600'    },
  { key: 'automotriz',    emoji: '🚗', label: 'Automotriz',    gradient: 'from-slate-600 to-slate-700'    },
  { key: 'hogar',         emoji: '🏠', label: 'Hogar',         gradient: 'from-green-600 to-emerald-600'  },
  { key: 'educacion',     emoji: '🎓', label: 'Educación',     gradient: 'from-cyan-600 to-sky-600'       },
  { key: 'electricistas', emoji: '⚡', label: 'Electricistas', gradient: 'from-yellow-500 to-amber-500'   },
  { key: 'carpinteria',   emoji: '🪑', label: 'Carpintería',   gradient: 'from-amber-600 to-yellow-600'   },
]

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 14 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

export function CategoryGrid() {
  return (
    <section className="container py-10">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-display font-black">Explorar categorías</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Encuentra lo que necesitás</p>
        </div>
        <Link
          href="/explore"
          className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-0.5"
        >
          Ver todas →
        </Link>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 md:gap-3"
      >
        {CATS.map((cat) => (
          <motion.div key={cat.key} variants={item}>
            <Link
              href={`/search?cat=${cat.key}`}
              className="group relative flex flex-col items-center gap-2.5 p-3 md:p-4 rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-warm hover:-translate-y-0.5"
            >
              {/* Gradient glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-[0.12] dark:group-hover:opacity-[0.18] transition-opacity duration-300 rounded-2xl`}
              />
              {/* Bottom glow line */}
              <div
                className={`absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
              />

              <span className="text-2xl md:text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                {cat.emoji}
              </span>
              <span className="text-xs font-semibold text-center leading-tight relative z-10 text-foreground/70 group-hover:text-foreground transition-colors duration-300">
                {cat.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
