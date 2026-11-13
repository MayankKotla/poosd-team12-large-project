import { useState } from 'react'


function OpenShifts() {
  const [claimedShifts, setClaimedShifts] = useState<number[]>([]) 
  const [message, setMessage] = useState('') 

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Open Shifts
        </h1>

        <p className="text-slate-500 mt-2">
          Browse and claim available shifts from your coworkers.
        </p>
      </div>

      {/* Claim Confirmation Message */}
      {message && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6">
            {message}
        </div>
      )}

      {/* Available Shifts Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">

        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Available Shifts
        </h2>
        
        {/* Empty State */}
        {claimedShifts.length === 3 && (
        <div className="text-center py-10">
            <h3 className="text-lg font-semibold text-slate-700">
            No Available Shifts
            </h3>

            <p className="text-slate-500 mt-2">
            You've claimed all available shifts in this demo.
            </p>
        </div>
        )}


        {/* Available Shift Cards */}
        <div className="space-y-4">

        {/* Shift 1 */}
        {!claimedShifts.includes(1) && (
        <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center gap-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800">
                Monday, November 16
                </h3>

                <p className="text-slate-500 mt-1">
                9:00 AM - 5:00 PM
                </p>

                <p className="text-sm text-slate-500 mt-2">
                Offered by: Jordan Smith
                </p>
            </div>

           
            <button
            type="button"
            onClick={() => {
            setClaimedShifts((previous) => [...previous, 1])
            setMessage('Monday, November 16 shift claimed successfully! (Demo only)')
            }}
            disabled={claimedShifts.includes(1)}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
                claimedShifts.includes(1)
                ? 'bg-green-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            >
            {claimedShifts.includes(1) ? 'Claimed' : 'Claim Shift'}
            </button>

            </div>
        </div> )}

        {/* Shift 2 */}
        {!claimedShifts.includes(2) && (
        <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center gap-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800">
                Wednesday, November 18
                </h3>

                <p className="text-slate-500 mt-1">
                12:00 PM - 8:00 PM
                </p>

                <p className="text-sm text-slate-500 mt-2">
                Offered by: Taylor Johnson
                </p>
            </div>

 
            <button
            type="button"
            onClick={() => {
            setClaimedShifts((previous) => [...previous, 2])
            setMessage('Wednesday, November 18 shift claimed successfully! (Demo only)')
            }}
            disabled={claimedShifts.includes(2)}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
                claimedShifts.includes(2)
                ? 'bg-green-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            >
            {claimedShifts.includes(2) ? 'Claimed' : 'Claim Shift'}
            </button>

            </div>
        </div> )}

        {/* Shift 3 */}
        {!claimedShifts.includes(3) && (
        <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center gap-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800">
                Friday, November 20
                </h3>

                <p className="text-slate-500 mt-1">
                8:00 AM - 4:00 PM
                </p>

                <p className="text-sm text-slate-500 mt-2">
                Offered by: Alex Brown
                </p>
            </div>

            
            <button
            type="button"
            onClick={() => {
            setClaimedShifts((previous) => [...previous, 3])
            setMessage('Friday, November 20 shift claimed successfully! (Demo only)')
            }}
            disabled={claimedShifts.includes(3)}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
                claimedShifts.includes(3)
                ? 'bg-green-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            >
            {claimedShifts.includes(3) ? 'Claimed' : 'Claim Shift'}
            </button>

            </div>
        </div>)}

        </div>


      </div>

    </div>
  )
}

export default OpenShifts
