import { memo } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '../constants'

const Glass = memo(function Glass({ children, className = '', interactive = false, ...props }) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      {...fadeUp}
      {...(interactive ? { whileHover: { scale: 1.01 }, whileTap: { scale: 0.98 } } : {})}
      {...props}
    >
      {children}
    </motion.div>
  )
})

export default Glass
