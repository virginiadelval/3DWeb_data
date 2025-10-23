import React from 'react'
import { createPortal } from 'react-dom'
import { Box, Typography, IconButton, Link } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import decorators from 'theme/fontsDecorators'
import theme from 'theme'

const LeyPopUp = ({ openPopUp, setOpenPopUp }) => {
  return (
    <>
      {openPopUp &&
        createPortal(
          <Box
            sx={{
              position: 'absolute',
              zIndex: 10000,
              bgcolor: theme.palette.secondary.main,
              left: '90px',
              top: '12px',
              width: { xs: '300px', sm: '510px' },
              padding: '20px',
              borderRadius: '5px'
            }}
          >
            <IconButton
              aria-label="close"
              sx={{ position: 'absolute', right: 0, top: 0 }}
              onClick={() => setOpenPopUp(false)}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="body1">
            La información correspondiente a volumetrías y usos se encuentra en proceso de actualización según nueva normativa vigente desde el 26/12/2024. Consulta la <Link href="https://cdn2.buenosaires.gob.ar/jefaturadegabinete/desarrollourbano/LEY%206776%20N.pdf" component="a" target='_blanck'>“LEY N.° 6776: Modificaciones al Código Urbanístico”.</Link>
            </Typography>
          </Box>,
          document.body
        )}
    </>
  )
}

export default LeyPopUp