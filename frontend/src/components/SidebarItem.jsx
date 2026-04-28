import { alpha } from '@mui/material/styles'
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { NavLink } from 'react-router-dom'

function SidebarItem({ label, path, icon, active = false, onClick }) {
  return (
    <ListItemButton
      component={NavLink}
      to={path}
      onClick={onClick}
      sx={{
        minHeight: 56,
        px: 1.75,
        py: 1.1,
        borderRadius: 1,
        mb: 1,
        alignItems: 'center',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: active ? alpha('#ffffff', 0.18) : 'transparent',
        borderLeft: active ? '4px solid #facc15' : '4px solid transparent',
        transition: 'background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          backgroundColor: active ? alpha('#ffffff', 0.22) : alpha('#ffffff', 0.12),
          transform: 'translateX(2px)',
        },
        '&.active': {
          backgroundColor: alpha('#ffffff', 0.18),
        },
        '&:focus-visible': {
          outline: 'none',
          boxShadow: `0 0 0 3px ${alpha('#ffffff', 0.2)}`,
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 40,
          color: active ? '#ffffff' : alpha('#ffffff', 0.92),
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontSize: '0.98rem',
          fontWeight: active ? 700 : 500,
          lineHeight: 1.25,
        }}
      />
    </ListItemButton>
  )
}

export default SidebarItem
