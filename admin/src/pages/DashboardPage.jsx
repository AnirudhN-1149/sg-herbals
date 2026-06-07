import React, { useState, useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'

const statCards = [
  {
    key: 'totalSales',
    label: 'Total Sales',
    icon: 'payments',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
    prefix: '₹'
  },
  {
    key: 'totalProducts',
    label: 'Total Products',
    icon: 'inventory',
    iconBg: 'bg-primary-fixed/40',
    iconColor: 'text-primary',
  },
  {
    key: 'activeProducts',
    label: 'Active Products',
    icon: 'verified',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
  },
  {
    key: 'pendingOrders',
    label: 'Orders to Complete',
    icon: 'pending_actions',
    iconBg: 'bg-error-container',
    iconColor: 'text-on-error-container',
  },
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: 'receipt_long',
    iconBg: 'bg-primary-fixed/40',
    iconColor: 'text-primary',
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalOrders: 0
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [dashRes, prodRes] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/stats'),
          fetch('http://localhost:5000/api/products') // just to get active vs inactive
        ])
        const dashData = await dashRes.json()
        const prodData = await prodRes.json()
        
        let active = 0;
        if (prodData.success) {
           active = prodData.data.filter(p => p.isActive).length;
        }

        if (dashData.success) {
          const d = dashData.data;
          setStats({
            totalSales: d.totalSales,
            totalProducts: d.totalProducts,
            activeProducts: active,
            pendingOrders: d.totalOrders - d.completedOrders,
            totalOrders: d.totalOrders
          })
        }
      } catch(e) { console.error(e) }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto md:ml-64 pb-16 md:pb-0">
        <AdminTopBar pageTitle="Dashboard" />

        <main className="flex-1 p-6 space-y-6">
          {/* Welcome */}
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Welcome back, Alex.</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">
              Here's what's happening with your store today.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                    <span className={`material-symbols-outlined text-[20px] ${card.iconColor}`}>{card.icon}</span>
                  </div>
                  {card.change && (
                    <span
                      className={`text-label-sm font-label-sm px-2 py-0.5 rounded-full ${
                        card.changePositive
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {card.change}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-headline-md font-headline-md text-on-surface">
                    {card.prefix || ''}{stats[card.key]?.toLocaleString()}
                  </p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Overview removed for now as it had hardcoded data */}
        </main>
      </div>
    </div>
  )
}
