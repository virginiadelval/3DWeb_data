import React, { useState, useCallback } from 'react'

import {
  Box,
  Avatar,
  InputBase,
  ListItemAvatar,
  ListItemText,
  ListItem,
  ListItemButton,
  Paper
} from '@mui/material'
import PlaceIcon from '@mui/icons-material/Place'
import SearchIcon from '@mui/icons-material/Search'
import StarIcon from '@mui/icons-material/Star'

import Downshift from 'downshift'

import PropTypes from 'prop-types'

import styles from './styles'
import { Autocompleter as NewAutocompleter } from 'autocompleter-caba/dist/src'
import useDebounce from '../../hooks/useDebounce'

const Seeker = ({ onSelectItem }) => {
  const [suggestions, setSuggestions] = useState([])
  const { debounce } = useDebounce()

  const newAutocompleter = new NewAutocompleter()

  const handleNewAutocompleter = async (event) => {
    const text = event.target.value
    if (!text) return
    try {
      const suggestions = await newAutocompleter.getSuggestions(text)

      const filteredSuggestions = suggestions.filter(
        (suggestion) => suggestion.error !== true
      )
      if (filteredSuggestions.length === 0) {
        setSuggestions([
          {
            type: 'tipoalerta',
            title: 'No se hallaron resultados coincidentes'
          }
        ])
        return
      }
      setSuggestions(filteredSuggestions)
    } catch (error) {}
  }

  const handleSearchDirection = async (suggestionText, onSelectItem, type) => {
    try {
      const suggestion = await newAutocompleter.getSearch(suggestionText)

      if (suggestion?.error) {
        setSuggestions([
          {
            type: 'tipoalerta',
            title: suggestion.error
          }
        ])
        throw suggestion.error
      }

      if (type === 'address') {
        setSuggestions([])
        onSelectItem({
          data: {
            ...suggestion.data,
            coordenadas: {
              x: suggestion.data.coordenada_x,
              y: suggestion.data.coordenada_y
            }
          }
        })
      }

      if (type === 'place') {
        setSuggestions([])
        onSelectItem(suggestion)
      }
    } catch (error) {
      console.log(error, 'error, handleSearchDirection')
    }
  }

  const handleSearch = useCallback(
    debounce((e) => handleNewAutocompleter(e), 750),
    []
  )

  const handleSelectItem = (selectedSuggestion) => {
    if (selectedSuggestion.type !== 'tipoalerta')
      handleSearchDirection(
        selectedSuggestion.value,
        onSelectItem,
        selectedSuggestion.type
      )

    if (selectedSuggestion.type === 'tipoalerta') {
      setSuggestions([])
    }
  }

  const handleInputBlur = () => {
    setSuggestions([])
  }

  const renderInput = (props) => {
    const { inputProps, styles: StyleClass, ...other } = props
    const direcciónMasLarga = '125'
    return (
      <InputBase
        sx={StyleClass.input}
        inputProps={{
          ...inputProps,
          maxLength: direcciónMasLarga
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...other}
      />
    )
  }

  const renderSuggestion = (suggestionProps) => {
    const { suggestion, index, itemProps, highlightedIndex } = suggestionProps

    const title =
      suggestion.alias ||
      suggestion.title ||
      suggestion.nombre ||
      suggestion.value
    const subTitle = suggestion.subTitle
      ? suggestion.subTitle
      : suggestion.descripcion
    const Icono = suggestion.title ? PlaceIcon : StarIcon

    const isHighlighted = highlightedIndex === index

    return (
      <ListItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...itemProps}
        key={index}
        component="div"
        sx={styles.list}
        disablePadding
      >
        <ListItemButton selected={isHighlighted}>
          <ListItemAvatar>
            <Avatar>
              <Icono fontSize="small" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={title} secondary={subTitle} />
        </ListItemButton>
      </ListItem>
    )
  }

  return (
    <Box>
      <Downshift
        id="usig-autocomplete"
        onSelect={handleSelectItem}
        itemToString={(item) => item?.value || ''}
        initialHighlightedIndex={0}
        defaultHighlightedIndex={0}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          highlightedIndex,
          selectedItem
        }) => {
          const { onBlur, onFocus, ...inputProps } = getInputProps({
            placeholder: 'Buscar',
            onChange: (e) => {
              handleSearch(e)
            }
          })

          return (
            <div>
              <Paper sx={styles.root} data-tour="search-bar">
                <SearchIcon sx={{ marginLeft: '5px' }} />
                {renderInput({
                  styles,
                  inputProps,
                  onBlur: handleInputBlur
                })}
              </Paper>

              <Box
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...getMenuProps()}
                sx={styles.menuBox}
              >
                {suggestions.length !== 0 ? (
                  <Paper sx={styles.paper} square>
                    {suggestions.map((suggestion, index) => {
                      return renderSuggestion({
                        suggestion,
                        index,
                        itemProps: getItemProps({ item: suggestion }),
                        highlightedIndex,
                        selectedItem
                      })
                    })}
                  </Paper>
                ) : null}
              </Box>
            </div>
          )
        }}
      </Downshift>
    </Box>
  )
}

Seeker.propTypes = {
  onSelectItem: PropTypes.func.isRequired
}

export default Seeker
