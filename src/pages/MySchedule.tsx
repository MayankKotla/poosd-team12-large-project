
import { useState } from 'react'

type Shift = {
  id: number
  day: number
  date: string
  time: string
}

const shifts: Shift[] = [
  {
    id: 1,
    day: 9,
    date: 'Monday, November 9',
    time: '9:00 AM - 5:00 PM',
  },
  {
    id: 2,
    day: 11,
    date: 'Wednesday, November 11',
    time: '10:00 AM - 6:00 PM',
  },
  {
    id: 3,
    day: 13,
    date: 'Friday, November 13',
    time: '8:00 AM - 4:00 PM',
  },
]

const weekdays = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
]

function MySchedule() {
  const [offeredShifts, setOfferedShifts] = useState<number[]>([])
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const toggleShiftOffer = (shiftId: number) => {
    setOfferedShifts((previousShifts) => {
      if (previousShifts.includes(shiftId)) {
        return previousShifts.filter((id) => id !== shiftId)
      }

      return [...previousShifts, shiftId]
    })
  }

  const isShiftOffered = (shiftId: number) => {
    return offeredShifts.includes(shiftId)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          My Schedule
        </h1>

        <p className="text-slate-500 mt-2">
          View your upcoming shifts and manage your schedule.
        </p>
      </div>

      {/* View Selection */}
      <div className="flex gap-3 mb-6">

        <button
          type="button"
          onClick={() => setView('list')}
          className={`px-5 py-2 rounded-lg font-medium ${
            view === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-300'
          }`}
        >
          List View
        </button>

        <button
          type="button"
          onClick={() => setView('calendar')}
          className={`px-5 py-2 rounded-lg font-medium ${
            view === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-300'
          }`}
        >
          Calendar View
        </button>

      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">

          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >

              <div className="flex justify-between items-start gap-4">

                {/* Shift Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {shift.date}
                  </h3>

                  <p className="text-slate-500 mt-2">
                    {shift.time}
                  </p>
                </div>

                {/* Shift Status */}
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    isShiftOffered(shift.id)
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {isShiftOffered(shift.id)
                    ? 'Offered'
                    : 'Scheduled'}
                </span>

              </div>

              {/* Offer Shift Button */}
              <div className="flex justify-end mt-5">
                <button
                  type="button"
                  onClick={() => toggleShiftOffer(shift.id)}
                  className={`text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                    isShiftOffered(shift.id)
                      ? 'bg-slate-600 hover:bg-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isShiftOffered(shift.id)
                    ? 'Cancel Offer'
                    : 'Offer Shift'}
                </button>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm p-6">

          {/* Calendar Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              November 2026
            </h2>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">

            {/* Weekday Headings */}
            {weekdays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-slate-600 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {Array.from({ length: 35 }, (_, index) => {
              const day = index + 1
              const shift = shifts.find(
                (scheduledShift) => scheduledShift.day === day
              )

              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-3 min-h-24 text-slate-700"
                >

                  {/* Day Number */}
                  {day <= 30 && (
                    <span className="text-sm font-medium">
                      {day}
                    </span>
                  )}

                  {/* Shift Information */}
                  {shift && (
                    <div
                      className={`mt-2 p-2 rounded-md text-xs font-medium ${
                        isShiftOffered(shift.id)
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <p>{shift.time}</p>

                      <p className="mt-1">
                        {isShiftOffered(shift.id)
                          ? 'Offered'
                          : 'Scheduled'}
                      </p>
                    </div>
                  )}

                </div>
              )
            })}

          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap gap-5 mt-6 text-sm text-slate-600">

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
              <span>Scheduled Shift</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" />
              <span>Offered Shift</span>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default MySchedule
