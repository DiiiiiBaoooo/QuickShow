// components/Loading.jsx
import React from 'react';

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-staircase [animation-delay:-0.4s]"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-staircase [animation-delay:-0.2s]"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-staircase"></div>
      </div>
    </div>
  );
};

// Định nghĩa keyframes trong file CSS hoặc inline style
const styles = `
  .animate-staircase {
    animation: staircase 1.2s ease-in-out infinite;
  }

  @keyframes staircase {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }
`;

// Thêm style vào document (nếu không dùng file CSS riêng)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Loading;