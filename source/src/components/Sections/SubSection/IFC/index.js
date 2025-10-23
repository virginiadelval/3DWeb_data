import React, { useState, useRef, useEffect } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import RotateRightIcon from '@mui/icons-material/RotateRight'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import ContainerBar from 'components/Sections/ContainerBar'
import Grid from '@mui/material/Unstable_Grid2'
import {
  Box,
  Typography,
  Link,
  Switch,
  FormGroup,
  FormControlLabel,
  Button,
  Alert
} from '@mui/material'

import {
  setIFCModelBlob,
  setModelLng,
  setModelRotate,
  setModelLat,
  setModelStep,
  setIsFileUploaded,
  setIsFileTypeIFC,
  setFileError,
  setIsVolumetriaChecked
} from 'state/ducks/IFC'
import { useDispatch, useSelector } from 'react-redux'

import styles from './styles'
import decorators from 'theme/fontsDecorators'
import MapaInteractivoGL from 'utils/MapaInteractivoGL'
import SelectParcel from 'components/Sections/SubSection/SelectParcel'
import { IFCAnalytics } from 'utils/reactga4'
import PressAndHold from './PressAndHoldButton'
import bytesToMegaBytes from 'utils/bytesToMegaBytes'

const IFC = () => {
  const modelCoordinates = useSelector((state) => state.IFC.modelCoordinates)
  const modelRotation = useSelector((state) => state.IFC.modelRotateValue)
  const IFCModelBlob = useSelector((state) => state.IFC.IFCModelBlob)
  const isVolumetriaChecked = useSelector(
    (state) => state.IFC.isVolumetriaChecked
  )
  const isModelMounted = useSelector((state) => state.IFC.isModelMounted)
  const modelStep = useSelector((state) => state.IFC.modelStep)
  const fileError = useSelector((state) => state.IFC.fileError)
  const smp = useSelector((state) => state.parcel.smp)
  const centroideState = useSelector((state) => state.basicData.data.centroide)
  const IFCFile = useRef(null)

  const mapGL = MapaInteractivoGL()

  useEffect(() => {
    if (!centroideState) dispatch(setIsVolumetriaChecked(true))
  }, [centroideState])

  const handleChangeVolumetria = (e) => {
    const { checked } = e.target
    dispatch(setIsVolumetriaChecked(checked))
    checked
      ? mapGL.map.setLayoutProperty('edif_smp', 'visibility', 'visible')
      : mapGL.map.setLayoutProperty('edif_smp', 'visibility', 'none')
  }

  const dispatch = useDispatch()
  const handleChange = (e) => {
    const file = e.target.files[0]
    const fileName = e.target.files[0]?.name
    const IFCFileRegex = /\.ifc$/i
    const size = e.target.files[0]?.size
    const MAX_FILE_SIZE_IN_BYTES = 26214400 // 25MB
    const MAX_FILE_LENGTH = 50

    if (bytesToMegaBytes(size) > bytesToMegaBytes(MAX_FILE_SIZE_IN_BYTES)) {
      dispatch(setFileError('El archivo no debe superar los 25 mb'))
      return
    }

    if (fileName?.length > MAX_FILE_LENGTH) {
      dispatch(
        setFileError(
          'La longitud del archivo no debe superar los 50 caracteres'
        )
      )
      return
    }

    if (IFCFileRegex.test(fileName)) {
      const IFCBlob = URL.createObjectURL(file)
      dispatch(setIFCModelBlob(IFCBlob))
      dispatch(setIsFileUploaded(true))
      IFCAnalytics('upload')
      dispatch(setIsFileTypeIFC(true))
      dispatch(setFileError(''))
      dispatch(setIsVolumetriaChecked(true))
      mapGL.map.setLayoutProperty('edif_smp', 'visibility', 'visible')
    } else {
      dispatch(setIFCModelBlob(''))
      dispatch(setIsFileUploaded(false))
      dispatch(setIsFileTypeIFC(false))
      dispatch(setFileError('El archivo debe ser de tipo .ifc'))
      IFCFile.current.value = ''
    }
  }

  const RADIO_ECUATORIAL = 6378137
  const FACTOR_ACHATAMIENTO_DE_LA_TIERRA = 1 / 298.257223563
  const DIRECCION_Y_DEL_MAPA = 360 / (2 * Math.PI * RADIO_ECUATORIAL)
  const LAT = modelCoordinates[1]
  const LNG = modelCoordinates[0]

  const handleModelStep = (e) => {
    const { valueAsNumber } = e.target
    dispatch(setModelStep(valueAsNumber))
  }

  const handleEliminateIFCModel = () => {
    URL.revokeObjectURL(IFCModelBlob)
    dispatch(setIFCModelBlob(''))
    dispatch(setIsFileUploaded(false))
    if (IFCFile.current) IFCFile.current.value = ''
  }

  const handleRotateModel = (direction) => {
    if (direction === 'right') {
      dispatch(setModelRotate(modelRotation - Math.PI / 180))
    } else {
      dispatch(setModelRotate(modelRotation + Math.PI / 180))
    }
  }

  const calculateModelPosition = (
    GAMMA,
    TAMAÑO_DESPLAZAMIENTO,
    IS_DESPLAZAMIENTO_X_MODELO
  ) => {
    let DESPLAZAMIENTO_X_BASE
    let DESPLAZAMIENTO_Y_BASE
    if (IS_DESPLAZAMIENTO_X_MODELO == 1) {
      DESPLAZAMIENTO_X_BASE = -TAMAÑO_DESPLAZAMIENTO * Math.cos(GAMMA)
      DESPLAZAMIENTO_Y_BASE = -TAMAÑO_DESPLAZAMIENTO * Math.sin(GAMMA)
    } else {
      DESPLAZAMIENTO_X_BASE = -TAMAÑO_DESPLAZAMIENTO * Math.sin(GAMMA)
      DESPLAZAMIENTO_Y_BASE = TAMAÑO_DESPLAZAMIENTO * Math.cos(GAMMA)
    }

    const RADIO_PARALELO =
      RADIO_ECUATORIAL /
      Math.sqrt(
        (1 -
          FACTOR_ACHATAMIENTO_DE_LA_TIERRA * Math.sin((LAT * Math.PI) / 180)) ^
          2
      )
    const DIRECCION_X_DEL_MAPA = 360 / (2 * Math.PI * RADIO_PARALELO)

    const COORDENADA_FINAL_LAT =
      LAT + DESPLAZAMIENTO_Y_BASE * DIRECCION_Y_DEL_MAPA
    const COORDENADA_FINAL_LNG =
      LNG + DESPLAZAMIENTO_X_BASE * DIRECCION_X_DEL_MAPA

    dispatch(setModelLng(COORDENADA_FINAL_LNG))
    dispatch(setModelLat(COORDENADA_FINAL_LAT))
  }

  const grados = (modelRotation * 180) / Math.PI
  return (
    <ContainerBar type="list">
      {smp && (
        <>
          <Box sx={styles.card}>
            <Typography variant="subtitle2" sx={decorators.bold}>
              Cómo cargar tu proyecto en Ciudad3D desde tu PC
            </Typography>
            <Typography variant="subtitle2">
              Podrás cargar tus proyectos y ver de manera real cómo estos se
              relacionan con el resto de las parcelas de la Ciudad siguiendo{' '}
              <Link
                href="https://www.youtube.com/watch?v=sG5GCK1Xf7c"
                target="_blank"
                rel="noopener"
              >
                este tutorial
              </Link>
              . <br />
              <br />
              Estos archivos deberán ser cargados en formato .ifc, no deben
              superar los 25 mb y la longitud debe ser de hasta 50 caracteres.
            </Typography>
          </Box>
          <Typography sx={{ ...decorators['bold'], marginBottom: '4px' }}>
            Carga tu proyecto desde aqui
          </Typography>
          {IFCModelBlob ? null : (
            <input
              ref={IFCFile}
              type="file"
              accept=".ifc"
              onChange={handleChange}
            />
          )}
          {fileError && (
            <Alert sx={{ mt: '10px' }} severity="error">
              {fileError}
            </Alert>
          )}
          {isModelMounted && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginTop: '16px'
              }}
            >
              <Grid container spacing={0}>
                <Grid container xs>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <PressAndHold
                      onClick={() => handleRotateModel('right')}
                      onLongPress={() => handleRotateModel('right')}
                    >
                      <RotateRightIcon />
                    </PressAndHold>
                  </Grid>
                </Grid>
                <Grid
                  container
                  xs={5}
                  sx={{
                    border: '1px solid black',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(241, 241, 243)'
                  }}
                >
                  <Grid
                    item
                    xs={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  ></Grid>
                  <Grid
                    item
                    xs={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <PressAndHold
                      onClick={() =>
                        calculateModelPosition(modelRotation, modelStep, 1)
                      }
                      onLongPress={() =>
                        calculateModelPosition(modelRotation, modelStep, 1)
                      }
                    >
                      <ArrowUpwardIcon />
                    </PressAndHold>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  ></Grid>
                  <Grid
                    item
                    xs={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <PressAndHold
                      onClick={() =>
                        calculateModelPosition(modelRotation, -modelStep, 0)
                      }
                      onLongPress={() =>
                        calculateModelPosition(modelRotation, -modelStep, 0)
                      }
                    >
                      <ArrowBackIcon />
                    </PressAndHold>
                  </Grid>
                  <Grid item xs={4}></Grid>
                  <Grid
                    item
                    xs={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <PressAndHold
                      onClick={() =>
                        calculateModelPosition(modelRotation, modelStep, 0)
                      }
                      onLongPress={() =>
                        calculateModelPosition(modelRotation, modelStep, 0)
                      }
                    >
                      <ArrowForwardIcon />
                    </PressAndHold>
                  </Grid>
                  <Grid item xs={4}></Grid>
                  <Grid
                    item
                    xs={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <PressAndHold
                      onClick={() =>
                        calculateModelPosition(modelRotation, -modelStep, 1)
                      }
                      onLongPress={() =>
                        calculateModelPosition(modelRotation, -modelStep, 1)
                      }
                    >
                      <ArrowDownwardIcon />
                    </PressAndHold>
                  </Grid>
                  <Grid item xs={4}></Grid>
                </Grid>
                <Grid container xs>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <PressAndHold
                      onClick={() => handleRotateModel('left')}
                      onLongPress={() => handleRotateModel('left')}
                    >
                      <RotateLeftIcon />
                    </PressAndHold>
                  </Grid>
                </Grid>
              </Grid>
              <div>Grados:{grados.toFixed(2)}</div>
              <label style={{ display: 'flex' }}>
                Mover:
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={modelStep}
                  onChange={handleModelStep}
                />{' '}
                mts.
              </label>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="contained" onClick={handleEliminateIFCModel}>
                  Eliminar IFC
                </Button>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        onChange={handleChangeVolumetria}
                        checked={isVolumetriaChecked}
                      />
                    }
                    label="Volumetría"
                  ></FormControlLabel>
                </FormGroup>
              </Box>
            </Box>
          )}
        </>
      )}
      {!smp && <SelectParcel />}
      <Box></Box>
    </ContainerBar>
  )
}
export default IFC
