
import { Link } from 'react-router-dom'
function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Main Dashboard Content */}
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-slate-900">
          Employee Dashboard
        </h2>

        <p className="text-slate-500 mt-2">
          Welcome back! Here's your schedule overview.
        </p>

        
        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

        {/* Upcoming Shifts Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">
            Upcoming Shifts
            </h3>

            <p className="text-4xl font-bold text-blue-700 mt-3">
            4
            </p>

            <p className="text-sm text-slate-400 mt-2">
            Scheduled shifts
            </p>
        </div>

        {/* Weekly Hours Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">
            Hours This Week
            </h3>

            <p className="text-4xl font-bold text-blue-700 mt-3">
            24
            </p>

            <p className="text-sm text-slate-400 mt-2">
            Total scheduled hours
            </p>
        </div>

        </div>

        
        {/* Upcoming Shifts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-8 p-6">

        <h3 className="text-xl font-bold text-slate-900 mb-6">
            Upcoming Shifts
        </h3>

        <div className="space-y-4">

            {/* Shift 1 */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
                <p className="font-semibold text-slate-800">
                Monday, November 9
                </p>
                <p className="text-sm text-slate-500 mt-1">
                9:00 AM - 5:00 PM
                </p>
            </div>

            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                Scheduled
            </span>
            </div>

            {/* Shift 2 */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
                <p className="font-semibold text-slate-800">
                Wednesday, November 11
                </p>
                <p className="text-sm text-slate-500 mt-1">
                10:00 AM - 6:00 PM
                </p>
            </div>

            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                Scheduled
            </span>
            </div>

            {/* Shift 3 */}
            <div className="flex justify-between items-center pb-2">
            <div>
                <p className="font-semibold text-slate-800">
                Friday, November 13
                </p>
                <p className="text-sm text-slate-500 mt-1">
                8:00 AM - 4:00 PM
                </p>
            </div>

            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                Scheduled
            </span>
            </div>

            
            <div className="mt-6">
            <Link
                to="/schedule"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
                View Full Schedule
            </Link>
            </div>


        </div>
        </div>


      </main>

    </div>

  )
}

export default EmployeeDashboard
