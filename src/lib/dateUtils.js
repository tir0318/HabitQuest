import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * Formats a date to "YYYY/MM/DD (曜) HH:mm:ss"
 * @param {Date|string|number} date 
 * @returns {string}
 */
export const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return format(d, 'yyyy/MM/dd (eee) HH:mm:ss', { locale: ja });
};

/**
 * Formats a date to "yyyy/MM/dd"
 * @param {Date|string|number} date 
 * @returns {string}
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return format(d, 'yyyy/MM/dd', { locale: ja });
};
