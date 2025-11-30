// components/Footer.tsx
import { useTranslation } from '@/lib/i18n';

type FooterVariant = 'dark' | 'light';

interface FooterProps {
  variant?: FooterVariant;
}

export default function Footer({ variant = 'dark' }: FooterProps) {
  const { t } = useTranslation();

  // Base classes
  const bgClass = variant === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700';
  const titleClass = variant === 'dark' ? 'text-white' : 'text-gray-900';
  const linkHoverClass = variant === 'dark' ? 'hover:text-cyan-400' : 'hover:text-blue-600';
  const borderClass = variant === 'dark' ? 'border-gray-800' : 'border-gray-300';

  return (
    <footer className={`${bgClass} py-12`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* COPYRIGHT */}
        <div className="space-y-2">
          <h3 className={`font-bold text-lg ${titleClass}`}>{t('copyright')}</h3>
          <p className="text-sm opacity-90">{t('allRightsReserved')}</p>
        </div>

        {/* OUR SERVICES */}
        <div className="space-y-3">
          <h3 className={`font-bold text-lg ${titleClass}`}>{t('ourServices')}</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className={`${linkHoverClass} transition`}>{t('bookBorrowing')}</a></li>
            <li><a href="#" className={`${linkHoverClass} transition`}>{t('searchBooks')}</a></li>
            <li><a href="#" className={`${linkHoverClass} transition`}>{t('bookAdding')}</a></li>
            <li><a href="#" className={`${linkHoverClass} transition`}>{t('bookReturning')}</a></li>
          </ul>
        </div>

        {/* QUICK LINKS */}
        <div className="space-y-3">
          <h3 className={`font-bold text-lg ${titleClass}`}>{t('quickLinks')}</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className={`${linkHoverClass} transition`}>{t('dashboard')}</a></li>
            <li><a href="#" className={`${linkHoverClass} transition`}>{t('books')}</a></li>
            <li><a href="#" className={`${linkHoverClass} transition`}>{t('myAccount')}</a></li>
            <li><a href="#" className={`${linkHoverClass} transition`}>{t('setting')}</a></li>
          </ul>
        </div>

        {/* CONTACT US */}
        <div className="space-y-3">
          <h3 className={`font-bold text-lg ${titleClass}`}>{t('contactUs')}</h3>
          <div className="text-sm space-y-1">
            <p>{t('woldiaUniversity')}</p>
            <p className={variant === 'dark' ? 'text-cyan-400' : 'text-blue-600'}>
              {t('phone')} +251 983 610 499
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`mt-10 pt-8 border-t ${borderClass} text-center text-xs opacity-70`}>
        © {new Date().getFullYear()} {t('librarySystem')}. {t('allRightsReserved')}
      </div>
    </footer>
  );
}