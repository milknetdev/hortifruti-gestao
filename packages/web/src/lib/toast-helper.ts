import toast from 'react-hot-toast';

// Custom toast with close button
export const showToast = {
  success: (message: string) => {
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg border cursor-pointer transition-all ${
          t.visible ? 'animate-enter' : 'animate-leave'
        }`}
        style={{ maxWidth: '400px' }}
        onClick={() => toast.dismiss(t.id)}
      >
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm text-gray-700 flex-1">{message}</span>
        <button
          onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ));
  },
  error: (message: string) => {
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg border cursor-pointer transition-all ${
          t.visible ? 'animate-enter' : 'animate-leave'
        }`}
        style={{ maxWidth: '400px' }}
        onClick={() => toast.dismiss(t.id)}
      >
        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <span className="text-sm text-gray-700 flex-1">{message}</span>
        <button
          onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ));
  },
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string) => toast.dismiss(id),
};
