import React from 'react'

interface LoadingSpinnerProps {
  className?: string
  message?: string
}

export default function LoadingSpinner({ className = 'w-6 h-6', message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-gray-600 ${className}`} />
      {message && (
        <p className="text-gray-600 mt-2 text-sm">{message}</p>
      )}
    </div>
  )
}