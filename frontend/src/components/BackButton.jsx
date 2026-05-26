import { useNavigate } from 'react-router-dom';

function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4"
    >
      <ArrowLeftIcon className="w-4 h-4" />
      <span>Volver</span>
    </button>
  );
}
