import { useState, useEffect } from 'react';
import { doctorsAPI } from '../api/doctors';
import { ratingsAPI } from '../api/ratings';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import AnimatedSection from '../components/animations/AnimatedSection';
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText';
import {
  StarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function Doctors() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '' });
  const [submitting, setSubmitting] = useState(false);
  const [favoriteDoctorId, setFavoriteDoctorId] = useState(() => localStorage.getItem('favoriteDoctorId') || null);

  const toggleFavorite = (e, doctorId) => {
    e.stopPropagation();
    if (favoriteDoctorId === doctorId) {
      setFavoriteDoctorId(null);
      localStorage.removeItem('favoriteDoctorId');
    } else {
      setFavoriteDoctorId(doctorId);
      localStorage.setItem('favoriteDoctorId', doctorId);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      setDoctors(response.data.doctors.filter(d => d.isActive));
    } catch (err) {
      error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const viewDoctorDetails = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowRatingModal(false);

    // Fetch ratings
    try {
      const response = await ratingsAPI.getDoctorRatings(doctor._id);
      setRatings(response.data.ratings);

      // Fetch user's rating if logged in
      if (user) {
        const myRatingResponse = await ratingsAPI.getMyRating(doctor._id);
        setMyRating(myRatingResponse.data.rating);
      }
    } catch (err) {
      console.error('Failed to load ratings:', err);
    }
  };

  const openRatingModal = () => {
    if (!user) {
      error('Please log in to rate this doctor');
      return;
    }

    if (myRating) {
      setRatingForm({ rating: myRating.rating, review: myRating.review || '' });
    } else {
      setRatingForm({ rating: 5, review: '' });
    }
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (myRating) {
        await ratingsAPI.updateRating(myRating._id, ratingForm);
        success('Rating updated! It will be reviewed by admin.');
      } else {
        await ratingsAPI.createRating({
          doctorId: selectedDoctor._id,
          ...ratingForm
        });
        success('Rating submitted! It will be visible after admin approval.');
      }

      setShowRatingModal(false);
      viewDoctorDetails(selectedDoctor); // Refresh ratings
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 'w-5 h-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <StarIconSolid
            key={star}
            className={`${size} ${star <= rating ? 'text-amber-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const getWorkingDays = (workingDays) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const working = days.filter(day => workingDays[day]?.isWorking);
    if (working.length === 0) return 'No days set';
    if (working.length === 7) return 'All days';
    return working.map(day => day.slice(0, 3).toUpperCase()).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate text-white py-24 md:py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeUp">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Our Specialists</p>
          </AnimatedSection>
          <AnimatedHeading level={1} className="text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Our Dental <GradientText>Experts</GradientText>
          </AnimatedHeading>
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Meet our team of experienced and qualified dental professionals dedicated to your oral health and beautiful smile.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <div className="min-h-[60vh] bg-luxury-cream py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Doctors Grid */}
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No doctors available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map(doctor => (
                <div
                  key={doctor._id}
                  className="premium-card p-6 cursor-pointer relative"
                  onClick={() => viewDoctorDetails(doctor)}
                >
                  {/* Favorite Heart */}
                  <button
                    onClick={(e) => toggleFavorite(e, doctor._id)}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    title={favoriteDoctorId === doctor._id ? 'Remove from favorites' : 'Set as favorite'}
                  >
                    {favoriteDoctorId === doctor._id ? (
                      <HeartIconSolid className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-400" />
                    )}
                  </button>
                  {/* Doctor Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    {doctor.photo && doctor.photo !== 'default-doctor.jpg' ? (
                      <img
                        src={doctor.photo}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-luxury-gold"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shrink-0">
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-luxury-charcoal truncate">
                        Dr. {doctor.name}
                      </h3>
                      <p className="text-luxury-gold text-sm">{doctor.specialization}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(doctor.rating)}
                    <span className="text-sm text-gray-600">
                      {doctor.rating.toFixed(1)} ({doctor.ratingCount || 0} reviews)
                    </span>
                  </div>

                  {/* Bio */}
                  {doctor.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{doctor.bio}</p>
                  )}

                  {/* Experience */}
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>{doctor.experience} years of experience</span>
                  </div>

                  {/* Qualifications */}
                  {doctor.qualifications && doctor.qualifications.length > 0 && (
                    <div className="flex items-start gap-2 text-gray-600 text-sm mb-4">
                      <AcademicCapIcon className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{doctor.qualifications.join(', ')}</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Button
                    variant="secondary"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewDoctorDetails(doctor);
                    }}
                  >
                    View Full Profile
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Doctor Detail Modal */}
          {selectedDoctor && (
            <Modal
              isOpen={!!selectedDoctor && !showRatingModal}
              onClose={() => setSelectedDoctor(null)}
              title={`Dr. ${selectedDoctor.name}`}
              size="lg"
            >
              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="flex items-start gap-4">
                  {selectedDoctor.photo && selectedDoctor.photo !== 'default-doctor.jpg' ? (
                    <img
                      src={selectedDoctor.photo}
                      alt={selectedDoctor.name}
                      className="w-24 h-24 rounded-full object-cover shrink-0 border-2 border-luxury-gold"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shrink-0">
                      {selectedDoctor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-luxury-charcoal mb-1">
                      Dr. {selectedDoctor.name}
                    </h2>
                    <p className="text-luxury-gold mb-2">{selectedDoctor.specialization}</p>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(selectedDoctor.rating)}
                      <span className="text-sm text-gray-600">
                        {selectedDoctor.rating.toFixed(1)} ({selectedDoctor.ratingCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedDoctor.bio && (
                  <div>
                    <h3 className="font-semibold text-luxury-charcoal mb-2">About</h3>
                    <p className="text-gray-600">{selectedDoctor.bio}</p>
                  </div>
                )}

                {/* Experience & Qualifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-luxury-gold mb-2">
                      <BriefcaseIcon className="w-5 h-5" />
                      <h4 className="font-semibold">Experience</h4>
                    </div>
                    <p className="text-gray-700">{selectedDoctor.experience} years</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-luxury-gold mb-2">
                      <AcademicCapIcon className="w-5 h-5" />
                      <h4 className="font-semibold">Qualifications</h4>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {selectedDoctor.qualifications?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Working Days */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-luxury-gold mb-2">
                    <CalendarDaysIcon className="w-5 h-5" />
                    <h4 className="font-semibold">Working Days</h4>
                  </div>
                  <p className="text-gray-700">{getWorkingDays(selectedDoctor.workingDays)}</p>
                </div>

                {/* Services */}
                {selectedDoctor.services && selectedDoctor.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-luxury-charcoal mb-3 flex items-center gap-2">
                      <CheckBadgeIcon className="w-5 h-5 text-luxury-gold" />
                      Services Provided
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.services.map(service => (
                        <span
                          key={typeof service === 'object' ? service._id : service}
                          className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm border border-amber-200"
                        >
                          {typeof service === 'object' ? service.name : 'Service'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rate This Doctor Button */}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={openRatingModal}
                >
                  {myRating ? 'Update My Rating' : 'Rate This Doctor'}
                </Button>

                {/* Reviews Section */}
                <div>
                  <h3 className="font-semibold text-luxury-charcoal mb-4">Patient Reviews</h3>
                  {ratings.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No reviews yet</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {ratings.map(rating => (
                        <div key={rating._id} className="border-b border-gray-200 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{rating.user?.name || 'Anonymous'}</p>
                              {renderStars(rating.rating, 'w-4 h-4')}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {rating.review && (
                            <p className="text-gray-600 text-sm">{rating.review}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Modal>
          )}

          {/* Rating Modal */}
          {selectedDoctor && showRatingModal && (
            <Modal
              isOpen={showRatingModal}
              onClose={() => setShowRatingModal(false)}
              title={myRating ? 'Update Your Rating' : 'Rate Dr. ' + selectedDoctor.name}
            >
              <form onSubmit={handleRatingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                        className="focus:outline-none"
                      >
                        <StarIconSolid
                          className={`w-10 h-10 ${star <= ratingForm.rating ? 'text-amber-400' : 'text-gray-300'
                            } hover:text-amber-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review (Optional)
                  </label>
                  <textarea
                    value={ratingForm.review}
                    onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                    rows={4}
                    maxLength={500}
                    className="input-field"
                    placeholder="Share your experience with this doctor..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{ratingForm.review.length}/500 characters</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Submitting...' : (myRating ? 'Update Rating' : 'Submit Rating')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowRatingModal(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Your rating will be reviewed by admin before being published
                </p>
              </form>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}
