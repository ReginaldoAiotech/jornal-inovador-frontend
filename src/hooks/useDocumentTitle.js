import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Plataforma Digital Conex` : 'Plataforma Digital Conex';
  }, [title]);
}
