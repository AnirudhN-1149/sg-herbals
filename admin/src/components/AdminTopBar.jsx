import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'



export default function AdminTopBar({ pageTitle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
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

  const handleLogoutConfirm = () => {
    localStorage.removeItem('adminToken')
    navigate('/')
  }

  return (
    <>
      <header className="w-full h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-sm flex justify-between items-center px-6 shrink-0">
        {/* Left: Logo & Brand, Page Title */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="SG Herbals Logo"
            className="w-8 h-8 rounded-lg object-contain lg:hidden"
          />
          <div className="lg:hidden">
            <p className="text-body-sm font-bold text-primary leading-none">SG Herbals</p>
            <p className="text-[10px] text-on-surface-variant opacity-70 mt-0.5">Admin</p>
          </div>
          <span className="lg:hidden text-on-surface-variant/30 text-[14px]">|</span>
          <h1 className="hidden lg:block text-headline-sm font-headline-sm text-primary">{pageTitle}</h1>
          <h1 className="lg:hidden text-body-md font-bold text-on-surface">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* User Profile - Desktop */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-surface-container transition-colors"
            >
              <div className="text-right">
                <p className="text-label-md font-label-md text-on-surface leading-none">Subhasree Giridhari</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant opacity-70 mt-0.5">Admin</p>
              </div>

              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 py-1 z-50">
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm font-body-sm text-error hover:bg-error-container/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Logout Button - Mobile/Tablet */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="lg:hidden flex items-center justify-center p-2 rounded-lg text-error hover:bg-error-container/20 transition-colors"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined text-[24px]">logout</span>
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          {/* Modal Box */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 w-[320px] shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error mb-4">
              <span className="material-symbols-outlined text-[24px]">logout</span>
            </div>
            
            <h3 className="text-headline-sm font-headline-sm text-primary mb-2">Confirm Logout</h3>
            <p className="text-body-sm text-on-surface-variant opacity-85 mb-6">Are you sure you want to log out of the admin portal?</p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 border border-outline-variant/40 rounded-lg text-body-sm font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 px-4 bg-error text-on-error rounded-lg text-body-sm font-bold hover:opacity-90 transition-all shadow-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
