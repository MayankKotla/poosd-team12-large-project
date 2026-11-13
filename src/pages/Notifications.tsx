
import { useState } from 'react'

type Notification = {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

const sampleNotifications: Notification[] = [
  {
    id: 1,
    title: 'New Shift Available',
    message: 'Jordan Smith has offered a shift for November 16.',
    time: '10 minutes ago',
    read: false,
  },
  {
    id: 2,
    title: 'Schedule Updated',
    message: 'Your schedule has been updated for this week.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    title: 'Shift Claimed',
    message: 'A coworker has claimed your offered shift.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 4,
    title: 'Upcoming Shift Reminder',
    message: 'You have a scheduled shift on November 13 at 8:00 AM.',
    time: 'Yesterday',
    read: true,
  },
]

function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(sampleNotifications)

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  const markAsRead = (id: number) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    )
  }

  const clearRead = () => {
    setNotifications((previous) =>
      previous.filter((notification) => !notification.read)
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Notifications
            </h1>
            <p className="text-slate-500 mt-2">
              Stay updated on shifts and schedule changes.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Mark All as Read
            </button>

            <button
              onClick={clearRead}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              Clear Read
            </button>
          </div>
        </div>

        {/* Unread Counter */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <p className="text-slate-600">
            You have{' '}
            <span className="font-bold text-blue-600">
              {unreadCount}
            </span>{' '}
            unread notifications.
          </p>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center">
              <h2 className="text-xl font-semibold text-slate-700">
                No Notifications
              </h2>
              <p className="text-slate-500 mt-2">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl shadow-sm p-6 border ${
                  notification.read
                    ? 'bg-white border-slate-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 mt-2">
                      {notification.message}
                    </p>

                    <p className="text-sm text-slate-400 mt-3">
                      {notification.time}
                    </p>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:underline text-sm whitespace-nowrap"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default Notifications
