import { useState } from 'react';
import { ratingsAPI } from '../../api/ratings';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/ui/Modal';
import {
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function RatingsTab({ ratings: initialRatings, onRefresh }) {
  const { success, error } = useNotification();
  const [ratings, setRatings] = useState(initialRatings || []);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedRating, setSelectedRating] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async (ratingId) => {
    if (!window.confirm('Approve this rating? It will be visible to all users.')) return;

    setLoading(true);
    try {
      await ratingsAPI.approveRating(ratingId);
      success('Rating approved successfully!');
      onRefresh();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to approve rating');
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (rating) => {
    setSelectedRating(rating);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      error('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await ratingsAPI.rejectRating(selectedRating._id, rejectionReason);
      success('Rating rejected successfully!');
      setShowRejectModal(false);
      onRefresh();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject rating');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ratingId, userName) => {
    if (!window.confirm(`Delete rating from ${userName}? This cannot be undone.`)) return;

    setLoading(true);
    try {
      await ratingsAPI.deleteRatingAdmin(ratingId);
      success('Rating deleted successfully!');
      onRefresh();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <StarIconSolid
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-amber-400' : 'text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredRatings = ratings.filter(rating => {
    if (filter === 'all') return true;
    return rating.status === filter;
  });

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Ratings & Reviews</h2>
          <p className="text-slate-400 text-sm mt-1">Manage patient ratings and reviews for doctors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-700/30 rounded-xl p-1 border border-white/5 w-fit">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'pending'
              ? 'bg-amber-500 text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClockIcon className="w-4 h-4 inline mr-1" />
          Pending ({ratings.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'approved'
              ? 'bg-green-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircleIcon className="w-4 h-4 inline mr-1" />
          Approved ({ratings.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'rejected'
              ? 'bg-red-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <XCircleIcon className="w-4 h-4 inline mr-1" />
          Rejected ({ratings.filter(r => r.status === 'rejected').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({ratings.length})
        </button>
      </div>

      {/* Ratings List */}
      {filteredRatings.length === 0 ? (
        <div className="text-center py-16">
          <StarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No {filter !== 'all' ? filter : ''} ratings found</p>
          <p className="text-slate-500 text-sm mt-1">
            {filter === 'pending' ? 'Ratings will appear here when patients submit reviews' : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRatings.map(rating => (
            <div
              key={rating._id}
              className="bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Rating Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-white font-semibold">
                            {rating.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-slate-400 text-xs">{rating.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-8">
                        <p className="text-slate-400 text-sm">for</p>
                        <div>
                          <p className="text-amber-400 font-medium">
                            Dr. {rating.doctor?.name || 'Unknown Doctor'}
                          </p>
                          <p className="text-slate-500 text-xs">{rating.doctor?.specialization}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[rating.status]}`}>
                      {rating.status.charAt(0).toUpperCase() + rating.status.slice(1)}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="mb-3">
                    {renderStars(rating.rating)}
                  </div>

                  {/* Review Text */}
                  {rating.review && (
                    <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
                      <p className="text-slate-300 text-sm">{rating.review}</p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {rating.status === 'rejected' && rating.rejectionReason && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                      <p className="text-red-400 text-xs font-medium mb-1">Rejection Reason:</p>
                      <p className="text-red-300 text-sm">{rating.rejectionReason}</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-slate-500 text-xs">
                    Submitted {new Date(rating.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  {rating.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(rating._id)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="text-sm">Approve</span>
                      </button>
                      <button
                        onClick={() => openRejectModal(rating)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        <span className="text-sm">Reject</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(rating._id, rating.user?.name)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all disabled:opacity-50"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Rating"
        dark
      >
        {selectedRating && (
          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-white/5">
              <p className="text-slate-400 text-sm mb-2">Rating from:</p>
              <p className="text-white font-medium">{selectedRating.user?.name}</p>
              <p className="text-slate-400 text-sm mt-1">for Dr. {selectedRating.doctor?.name}</p>
              <div className="mt-3">
                {renderStars(selectedRating.rating)}
              </div>
              {selectedRating.review && (
                <p className="text-slate-300 text-sm mt-3 italic">"{selectedRating.review}"</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
                placeholder="Explain why this rating is being rejected..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {loading ? 'Rejecting...' : 'Reject Rating'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
