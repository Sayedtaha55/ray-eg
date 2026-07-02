import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/ui';

const ReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto py-12 px-4" dir="rtl">
      <h1 className="text-3xl font-black text-center mb-8">{t('reviews.title')}</h1>
      <div className="flex flex-col gap-6 items-center">
        <Link to="/reviews/write">
          <Button className="w-64" size="lg" variant="primary">{t('reviews.writeButton')}</Button>
        </Link>
        <Link to="/reviews/list">
          <Button className="w-64" size="lg" variant="secondary">{t('reviews.viewButton')}</Button>
        </Link>
        <Link to="/support">
          <Button className="w-64" size="lg" variant="ghost">{t('reviews.helpButton')}</Button>
        </Link>
      </div>
    </div>
  );
};

export default ReviewsPage;
