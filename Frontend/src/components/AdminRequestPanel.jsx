import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, X } from "lucide-react"
import Button from "./Button"
import { useToast } from "../context/ToastContext"
import api from "../api/axios"

const AdminRequestPanel = ({ isOpen, onClose }) => {
  const { success, error: showError } = useToast()
  const [requests, setRequests] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve' or 'reject'
  const [actionNotes, setActionNotes] = useState("")
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  // Fetch pending requests
  const fetchRequests = async (page = 1) => {
    setLoading(true)
    try {
      const response = await api.get('/requests', {
        params: { status: 'pending', page, limit: 10 },
      })
      setRequests(response.data.requests || [])
      setCurrentPage(page)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch requests:", error)
      showError("Failed to load pending requests.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchRequests(1)
    }
  }, [isOpen])

  const handleApprove = async () => {
    if (!selectedRequest) return

    setIsSubmittingAction(true)
    try {
      await api.put(`/requests/${selectedRequest.id}/approve`, {
        notes: actionNotes || null,
      })

      success("✓ Request approved successfully!")
      setSelectedRequest(null)
      setActionType(null)
      setActionNotes("")
      fetchRequests(currentPage)
    } catch (error) {
      showError(error.response?.data?.error || "Failed to approve request.")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !actionNotes.trim()) {
      showError("Please enter a rejection reason.")
      return
    }

    setIsSubmittingAction(true)
    try {
      await api.put(`/requests/${selectedRequest.id}/reject`, {
        reason: actionNotes,
      })

      success("✓ Request rejected successfully!")
      setSelectedRequest(null)
      setActionType(null)
      setActionNotes("")
      fetchRequests(currentPage)
    } catch (error) {
      showError(error.response?.data?.error || "Failed to reject request.")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="font-title text-2xl font-bold text-[#800000]">
              Pending Stock Requests
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-600">No pending requests</p>
            </div>
          ) : (
            <>
              {/* Requests Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Item</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Staff Member</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Quantity</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Purpose</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{request.consumable?.itemName}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {request.requestedBy?.fullName || request.requestedBy?.username}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            request.requestType === 'Stock In'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {request.requestType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-[#800000]">
                          {request.quantity}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {request.purpose || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
                              setActionType(null)
                              setActionNotes("")
                            }}
                            className="text-[#800000] hover:underline font-semibold text-sm"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => fetchRequests(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-slate-300 text-sm disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => fetchRequests(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-slate-300 text-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchRequests(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-slate-300 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => fetchRequests(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-slate-300 text-sm disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Review Modal (when selectedRequest is set) */}
        {selectedRequest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-lg">
              {/* Header */}
              <div className="border-b border-slate-200 p-6">
                <h3 className="font-title text-xl font-bold text-[#800000]">
                  Review Request
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Item</p>
                    <p className="font-semibold text-slate-800">{selectedRequest.consumable?.itemName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Staff Member</p>
                      <p className="font-semibold text-slate-800">{selectedRequest.requestedBy?.username}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Type</p>
                      <p className="font-semibold text-slate-800">{selectedRequest.requestType}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Quantity</p>
                      <p className="text-lg font-bold text-[#800000]">{selectedRequest.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Purpose</p>
                      <p className="font-semibold text-slate-800">{selectedRequest.purpose}</p>
                    </div>
                  </div>
                  {selectedRequest.reason && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Reason</p>
                      <p className="text-slate-700">{selectedRequest.reason}</p>
                    </div>
                  )}
                </div>

                {!actionType && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActionType('approve')}
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => setActionType('reject')}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100 border border-red-200 transition"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}

                {actionType && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {actionType === 'approve' ? 'Approval Notes (optional)' : 'Rejection Reason (required)'}
                      </label>
                      <textarea
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder={actionType === 'approve' ? 'Add any notes...' : 'Why are you rejecting this request?'}
                        rows="3"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                        required={actionType === 'reject'}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setActionType(null)
                          setActionNotes("")
                        }}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={actionType === 'approve' ? handleApprove : handleReject}
                        disabled={isSubmittingAction || (actionType === 'reject' && !actionNotes.trim())}
                        className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          actionType === 'approve'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {isSubmittingAction ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Reject')}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Close Button */}
              <div className="border-t border-slate-200 p-4">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminRequestPanel
