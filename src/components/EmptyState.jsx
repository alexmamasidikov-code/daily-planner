import { memo } from 'react'
import { motion } from 'framer-motion'
import { Circle } from 'lucide-react'
import { fadeUp } from '../constants'

const EmptyState = memo(function EmptyState({ icon: Icon = Circle, title, description, action, onAction }) {
  return (
    <motion.div {...fadeUp} className="glass-card p-8 text-center">
      <motion.div
        className="w-16 h-16 rounded-2xl bg-[#252525] flex items-center justify-center mx-auto mb-4"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <Icon size={28} className="text-[#9CA3AF]" strokeWidth={1.5} />
      </motion.div>
      <h3 className="text-[15px] font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-[13px] text-[#9CA3AF] max-w-xs mx-auto">{description}</p>}
      {action && onAction && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onAction} className="glass-btn text-sm mt-4 mx-auto flex items-center gap-1.5"
          aria-label={action}>
          {action}
        </motion.button>
      )}
    </motion.div>
  )
})

export default EmptyState
