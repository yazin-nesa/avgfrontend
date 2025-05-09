// components/ui/use-toast.js

import { toast } from 'sonner'

export function useToast() {
  const toastHandler = ({ title, description, variant = 'default' }) => {
    if (variant === 'destructive') {
      toast.error(title, { description })
    } else {
      toast.success(title, { description })
    }
  }

  return {
    toast: toastHandler,
  }
}
