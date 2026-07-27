import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getBookingActivityTypeFromPath, isBookingActivityRoute } from './config';
import BookingOverviewPage from './shared/BookingOverviewPage';

const BookingActivityPage: React.FC = () => {
  const { activity } = useParams<{ activity?: string }>();
  if (!isBookingActivityRoute(activity)) {
    return <Navigate to="/business" replace />;
  }
  const activityType = getBookingActivityTypeFromPath(activity || '');

  return (
    <BookingOverviewPage activityType={activityType} />
  );
};

export default BookingActivityPage;
