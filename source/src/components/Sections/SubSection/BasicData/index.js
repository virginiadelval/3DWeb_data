import React from 'react'

import PropTypes from 'prop-types'

import { Box, Typography, Grid, makeStyles, Link } from '@mui/material'

import decorators from 'theme/fontsDecorators'

import ContainerBar from 'components/Sections/ContainerBar'
import SelectParcel from 'components/Sections/SubSection/SelectParcel'
import Carrousel from 'components/Carrousel'

import { useSelector } from 'react-redux'

import { getBasicData } from 'utils/configQueries'

import styles from './styles'

const Details = ({ styles, decorators, title, value, format }) => (
  <>
    <Box sx={styles.card}>
      <Grid container>
        <Grid item xs={7}>
          <Typography variant="subtitle2" sx={decorators.bold}>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography variant="subtitle2" sx={styles.value}>
            {format === 'url' && value[0] && (
              <a
                class="external"
                href={value[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {value[2]}
              </a>
            )}
            {format === 'url' && !value[0] && 'Cargando. . .'}
            {format !== 'url' &&
              value[0] !== undefined &&
              `${value[0]} ${format}`}
            {format !== 'url' && value[0] === undefined && 'Cargando. . .'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  </>
)

const BasicData = () => {
  const data = useSelector((state) => state.basicData.data)
  const constitucionEstadoParcelario = useSelector(
    (state) => state.basicData.data.constitucionEstadoParcelario
  )
  const linkImagen = useSelector((state) => state.buildable.data?.link_imagen)
  const superficieParcela = useSelector(
    (state) => state.buildable.data.superficie_parcela
  )
  const isSelected = useSelector((state) => state.basicData.isSelected)
  const { photoData } = data

  return (
    <ContainerBar type="list">
      {isSelected && (
        <Box>
          {!!photoData?.length && <Carrousel photos={photoData} />}
          {getBasicData().map(({ title, fill, format, isNumber }, index) => {
            const fills = fill.split(',')
            const value = []

            const valueFill =
              fill === 'superficie_parcela'
                ? superficieParcela?.toString()
                : data[fills[0]]
            if (valueFill) {
              value.push(
                isNumber
                  ? Number.parseFloat(valueFill).toLocaleString('es-AR')
                  : valueFill
              )
            }
            if (format === 'url' && linkImagen) {
              value.push(linkImagen[fills[0]])
              value.push(...fills)
            }
            return (
              <Details
                // eslint-disable-next-line react/no-array-index-key
                key={title}
                styles={styles}
                decorators={decorators}
                title={title}
                value={value}
                format={format}
              />
            )
          })}
          {constitucionEstadoParcelario?.data.length > 0 &&
            constitucionEstadoParcelario.data.map((data) => (
              <Box
                key={`${data.estado_parcelario_constituido}_${data.fecha_de_constitucion}`}
                sx={styles.parcelarioAlert}
              >
                <Typography variant="subtitle2">
                  <Typography
                    variant="subtitle2"
                    component="span"
                    sx={decorators.bold}
                  >
                    Estado parcelario constituido:{' '}
                  </Typography>
                  {data.estado_parcelario_constituido}
                </Typography>
                <Typography variant="subtitle2">
                  <Typography
                    variant="subtitle2"
                    component="span"
                    sx={decorators.bold}
                  >
                    Fecha de constitución:{' '}
                  </Typography>
                  {data.fecha_de_constitucion}
                </Typography>
                <Typography variant="subtitle2">
                  <Typography
                    variant="subtitle2"
                    component="span"
                    sx={decorators.bold}
                  >
                    Tipo de constitución:{' '}
                  </Typography>
                  {data.tipo_de_construccion}
                </Typography>
                <Typography variant="subtitle2">
                  <Typography
                    variant="subtitle2"
                    component="span"
                    sx={decorators.bold}
                  >
                    Vencimiento de constitución:{' '}
                  </Typography>
                  {data.vencimiento_de_construccion}
                </Typography>
              </Box>
            ))}
        </Box>
      )}
      {!isSelected && <SelectParcel />}
    </ContainerBar>
  )
}

Details.propTypes = {
  styles: PropTypes.objectOf(makeStyles).isRequired,
  decorators: PropTypes.objectOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
  format: PropTypes.string.isRequired
}

Details.defaultProps = {
  value: ''
}

export default BasicData
