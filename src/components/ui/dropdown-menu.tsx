import * as React from 'react'
import { cn } from '@/lib/utils'

// Context for dropdown state management
interface DropdownContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

const DropdownContext = React.createContext<DropdownContextType | null>(null)

const useDropdownContext = () => {
  const context = React.useContext(DropdownContext)
  if (!context) {
    throw new Error('Dropdown components must be used within a DropdownMenu')
  }
  return context
}

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])
  
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
  }
>(({ className, children, asChild = false, onClick, ...props }, ref) => {
  const { toggle } = useDropdownContext()
  
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    toggle()
    onClick?.(e)
  }, [toggle, onClick])
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ref,
      onClick: handleClick,
      ...props,
      className: cn(className, (children as React.ReactElement).props.className),
    })
  }
  
  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'center', sideOffset = 4, ...props }, ref) => {
    const { isOpen, setIsOpen } = useDropdownContext()
    const contentRef = React.useRef<HTMLDivElement>(null)
    
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const content = contentRef.current
        const target = event.target as Node
        
        if (isOpen && content && !content.contains(target)) {
          // Check if click is on trigger
          const trigger = content.parentElement?.querySelector('button')
          if (trigger && !trigger.contains(target)) {
            setIsOpen(false)
          }
        }
      }
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, setIsOpen])
    
    React.useImperativeHandle(ref, () => contentRef.current!, [])
    
    if (!isOpen) return null
    
    return (
      <div
        ref={contentRef}
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-1 shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          align === 'start' && 'left-0',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          align === 'end' && 'right-0',
          className
        )}
        style={{ marginTop: sideOffset }}
        {...props}
      />
    )
  }
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, onClick, ...props }, ref) => {
  const { setIsOpen } = useDropdownContext()
  
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    setIsOpen(false)
  }, [onClick, setIsOpen])
  
  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = 'DropdownMenuItem'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}