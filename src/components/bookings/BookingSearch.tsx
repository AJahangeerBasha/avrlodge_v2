import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BookingSearchProps {
  onSearch: (searchTerm: string) => void
  loading: boolean
}

export default function BookingSearch({ onSearch, loading }: BookingSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchClick = () => {
    onSearch(searchTerm)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="flex items-center mb-2">
            <Search className="w-4 h-4 mr-2 text-gray-600" />
            Search Bookings
          </Label>
          <Input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference number, phone, name, or email..."
            onKeyPress={handleKeyPress}
            className="h-12 text-base"
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={handleSearchClick} 
            disabled={loading}
            className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </div>
            ) : (
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Search
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
