import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StudyApp - Planes y Suscripciones',
  description:
    'Elige el plan perfecto para tu excelencia académica. Desbloquea el poder del Método Feynman y la codificación del error con nuestros tutores de IA.',
};

export default function PlanesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

