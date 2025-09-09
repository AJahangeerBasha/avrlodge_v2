import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GuestFeedback } from '@/services/checkout.service'

interface FeedbackTabProps {
  guestFeedback: GuestFeedback
  onFeedbackChange: (feedback: GuestFeedback) => void
  onSubmit: () => void
}

export default function FeedbackTab({
  guestFeedback,
  onFeedbackChange,
  onSubmit
}: FeedbackTabProps) {
  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Feedback</h3>
        
        {/* Rating */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700">Overall Rating</Label>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onFeedbackChange({ ...guestFeedback, rating: star })}
                className={`p-1 rounded transition-colors ${
                  star <= guestFeedback.rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {guestFeedback.rating}/5 stars
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700">Feedback Category</Label>
          <Select
            value={guestFeedback.category}
            onValueChange={(value: any) => onFeedbackChange({ ...guestFeedback, category: value })}
          >
            <SelectTrigger className="mt-2 bg-white border-gray-300 text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="service" className="text-gray-900 hover:bg-gray-50">Service</SelectItem>
              <SelectItem value="cleanliness" className="text-gray-900 hover:bg-gray-50">Cleanliness</SelectItem>
              <SelectItem value="comfort" className="text-gray-900 hover:bg-gray-50">Comfort</SelectItem>
              <SelectItem value="value" className="text-gray-900 hover:bg-gray-50">Value for Money</SelectItem>
              <SelectItem value="overall" className="text-gray-900 hover:bg-gray-50">Overall Experience</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700">Comments</Label>
          <Textarea
            value={guestFeedback.comment}
            onChange={(e) => onFeedbackChange({ ...guestFeedback, comment: e.target.value })}
            placeholder="Share your experience and any suggestions for improvement..."
            className="mt-2 min-h-[100px]"
          />
        </div>

        <Button
          onClick={onSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Next: Create ToDo List
        </Button>
      </div>
    </motion.div>
  )
}