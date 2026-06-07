import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDurblPnNbctla6wxeceL1hTB1gAQXLE-XHOKQ7F0rBHCP0Y0hf006vxeGB4j503PZ6dvGBsT2zzPobJxo7mcTytGylAtFCzNofsH0nblqjsFfDPa1iCPof4X-eaaBJTZNc3Dsc6alQ5v6OnQzFCXHkGlWr6_gSGeQmWz8hHkVlc6EeQph-oj3a770RcUWhqWhMzM0_2lJkIXPeLg_X57XSZNRESlNRszgg6UCDgpvNjXOT4T1dcKPPWq4yxoABEDN8FNusyFRRakfI'

export default function AdminTopBar({ pageTitle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-sm flex justify-between items-center px-6">
      {/* Left: Page Title */}
      <h1 className="text-headline-sm font-headline-sm text-primary">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-surface-container transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-label-md font-label-md text-on-surface leading-none">Subhasree Giridhari</p>
              <p className="text-label-sm font-label-sm text-on-surface-variant opacity-70 mt-0.5">Admin</p>
            </div>
            <img
              src={AVATAR_URL}
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed"
            />
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 py-1 z-50">
              <button 
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm font-body-sm text-error hover:bg-error-container/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
