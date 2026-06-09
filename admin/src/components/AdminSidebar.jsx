import React from 'react'
import { NavLink } from 'react-router-dom'

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsmTl7RwJn8HJcQqyFactNbxMuCnevm_tv2VD5-iNJnNSw1yUv224pbe3XmnOQ2a_CPmrT0enfRHxKA4OSgiG1M_IQJGlwH1SMTMs4vy_t6ABqWa12RMM31ccI_FDZt6xsiQZj1MHsGxZ8zoxibtJvmOik6KY9NurlCHA6PN8ZYFs3yOxqygL4TH5oxItiFUnJ5kaVC4M5NrsvcbPKrXQgc36W7e5DEZJuNuKNHagAQD4HhcX1rzaJK9kwcdPL3NuYJJl_8rWGieSk'

const navItems = [
  { label: 'Orders', icon: 'shopping_cart', path: '/orders' },
  { label: 'Products', icon: 'spa', path: '/products' },
  { label: 'Inventory', icon: 'inventory_2', path: '/inventory' },
]

export default function AdminSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex-col py-10 px-4 z-50 border-r border-outline-variant/20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 mb-10">
        <img
          src={LOGO_URL}
          alt="SG Herbals Logo"
          className="w-10 h-10 rounded-lg object-contain"
        />
        <div>
          <p className="text-headline-sm font-headline-sm text-primary leading-tight">SG Herbals</p>
          <p className="text-label-sm font-label-sm text-on-surface-variant opacity-70">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200 ease-in-out'
                : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-all duration-200 ease-in-out'
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-body-md font-body-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant/20 z-50 flex items-center justify-around px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'flex flex-col items-center justify-center w-16 h-14 text-primary transition-colors'
                : 'flex flex-col items-center justify-center w-16 h-14 text-on-surface-variant hover:text-primary transition-colors'
            }
          >
            <span className="material-symbols-outlined text-[24px] mb-0.5">{item.icon}</span>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
