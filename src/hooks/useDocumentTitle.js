import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Jornal O Inovador` : 'Jornal O Inovador';
  }, [title]);
}
