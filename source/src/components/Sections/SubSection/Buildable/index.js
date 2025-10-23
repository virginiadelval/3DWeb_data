/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react'

import PropTypes from 'prop-types'

import {
  Box,
  Typography,
  Grid,
  IconButton,
  ListItem,
  TextField,
  InputAdornment,
  Link
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import decorators from 'theme/fontsDecorators'

import ContainerBar from 'components/Sections/ContainerBar'
import CustomTooltip from 'theme/wrappers/CustomTooltip'
import SelectParcel from 'components/Sections/SubSection/SelectParcel'

import { actions as buildableActions } from 'state/ducks/buildable'

import { actions as affectationsActions } from 'state/ducks/affectations'

import { useDispatch, useSelector } from 'react-redux'

import { getBuildable } from 'utils/configQueries'

import styles from './styles'

const ItemValues = ({ children, unit }) => {
  const values = children instanceof Array ? children : [children]
  return values.map(
    (v, idx) =>
      `${idx > 0 ? ' | ' : ''} ${v === undefined ? '' : v} ${unit || ''}`
  )
}
const Details = ({
  styles,
  title,
  data,
  items,
  isArea,
  smp,
  decorators,
  isEditing,
  isAffectation,
  setIsEditing,
  info,
  link,
  valueLink
}) => {
  const dispatch = useDispatch()
  const [areaValue, setAreaValue] = useState(0)

  const handleOnAreaChange = ({ target: { value } }) => {
    const isFloat = value[value.length - 1] === ',' ?? true
    const isEmpty = value === '' ?? true

    // eslint-disable-next-line no-nested-ternary
    const newAreaValue = isFloat
      ? value
      : isEmpty
      ? 0
      : Number.parseFloat(value.replace(/,/g, '.'))

    setAreaValue(Number.isNaN(newAreaValue) ? areaValue : newAreaValue)
  }

  useEffect(() => {
    if (isArea) {
      dispatch(buildableActions.areaChanged({ smp, text: areaValue }))
    }
  }, [dispatch, smp, areaValue, isArea])

  if (isAffectation) {
    return (
      <>
        {data?.afectaciones?.length > 0 &&
          data?.afectaciones.map(({ title, subtitle }) => (
            <>
              <Box sx={styles.title}>
                <Typography variant="subtitle2" sx={decorators.bold}>
                  {title}
                </Typography>
              </Box>
              <ListItem sx={styles.listado}>{subtitle}</ListItem>
            </>
          ))}
      </>
    )
  }
  return (
    <>
      <Box sx={styles.title}>
        <Typography variant="subtitle2" sx={decorators.bold}>
          {title}
        </Typography>
      </Box>
      <Box sx={styles.boxIcons}>
        {info && (
          <CustomTooltip sx={styles.tooltip} title={info} placement="top">
            <InfoOutlinedIcon sx={styles.info} />
          </CustomTooltip>
        )}
      </Box>
      {items &&
        items.map(({ label, field, unidad }) => (
          <ListItem key={unidad} sx={styles.listado}>
            {label}
            {isArea && isEditing ? (
              <TextField
                sx={styles.input}
                value={areaValue.toString().replace(/\./g, ',')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">{unidad}</InputAdornment>
                  )
                }}
                onChange={handleOnAreaChange}
              />
            ) : (
              <>
                <ItemValues unit={unidad}>
                  {field.split('.').reduce((p, c) => p && p[c], data)}
                </ItemValues>
              </>
            )}
            {isArea && (
              <IconButton
                onClick={() => setIsEditing(!isEditing)}
                sx={styles.button}
              >
                <EditIcon color={isEditing ? 'primary' : 'inherit'} />
              </IconButton>
            )}
          </ListItem>
        ))}
      {link && (
        <Link sx={styles.link} href={link} target="_blank" rel="noopener">
          {valueLink}
        </Link>
      )}
    </>
  )
}

const Buildable = () => {
  const data = useSelector((state) => state.buildable.data)
  const dispatch = useDispatch()
  const smp = useSelector((state) => state.parcel.smp)
  const isLoading = useSelector((state) => state.buildable.isLoading)
  const [isEditing, setIsEditing] = useState(false)
  const plusvalia = useSelector((state) => state.buildable.plusvalia)

  useEffect(() => {
    dispatch(buildableActions.clickOnParcel(smp))
    dispatch(affectationsActions.clickOnParcel(smp))
  }, [dispatch, smp])
  return (
    <ContainerBar type="list">
      <Grid container sx={styles.grid}>
        {getBuildable().map(
          ({
            title,
            items,
            isArea,
            isAffectation,
            isPlusvalia,
            large,
            info,
            link,
            valueLink
          }) => {
            const maxWidth = large === 6 ? 'small' : null
            if (isAffectation && data?.afectaciones?.length <= 0) return

            return (
              smp &&
              !isLoading && (
                <Grid
                  key={title}
                  item
                  xs={12}
                  sx={{ ...styles['gridItem'], ...styles[maxWidth] }}
                >
                  <Details
                    // eslint-disable-next-line react/no-array-index-key
                    key={title}
                    styles={styles}
                    decorators={decorators}
                    title={title}
                    items={items}
                    info={info}
                    link={link}
                    valueLink={valueLink}
                    data={isPlusvalia && isEditing ? plusvalia : data}
                    isArea={isArea}
                    isAffectation={isAffectation}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    smp={smp}
                  />
                </Grid>
              )
            )
          }
        )}
      </Grid>
      {!smp && !isLoading && <SelectParcel />}
      {isLoading && <Typography variant="body1">Cargando...</Typography>}
    </ContainerBar>
  )
}

Details.defaultProps = {
  isArea: false,
  info: '',
  link: '',
  valueLink: ''
}
Details.propTypes = {
  styles: PropTypes.objectOf(PropTypes.any).isRequired,
  decorators: PropTypes.objectOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
  info: PropTypes.string,
  link: PropTypes.string,
  valueLink: PropTypes.string,
  isEditing: PropTypes.bool.isRequired,
  setIsEditing: PropTypes.func.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isArea: PropTypes.bool,
  smp: PropTypes.string.isRequired
}

export default Buildable
