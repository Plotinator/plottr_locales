import React from 'react'
import { View, ImageBackground } from 'react-native'
import { t } from 'plottr_locales'
import { Text, ShellButton } from '../../shared/common'
import styles from './BookStyles'
import Images from '../../../images'
import { isTablet } from 'react-native-device-info'

const { BOOK } = Images

export default function Book(props) {
  const {
    editable,
    book: { id, title },
    style,
    navigateToOutline,
    navigateToDetails
  } = props
  const goToBook = () => {
    navigateToOutline(id)
  }
  const editBook = () => {
    navigateToDetails(id)
  }
  const bookStyles = [styles.book, style]
  const fontSize = isTablet() ? 'tiny' : 'regular'

  return (
    <ShellButton onPress={goToBook} style={bookStyles}>
      <ImageBackground
        source={BOOK}
        style={styles.bookImage}
        resizeMode='contain'>
        <View style={styles.titleWrapper}>
          <Text
            fontSize='small'
            fontStyle='bold'
            style={styles.bookTitle}
            center>
            {title || t('Untitled')}
          </Text>
        </View>
        <View style={[styles.actions, !editable && styles.centerButtons]}>
          {editable && (
            <ShellButton onPress={editBook} style={styles.button}>
              <Text fontSize={fontSize} fontStyle='semiBold'>
                {t('Edit')}
              </Text>
            </ShellButton>
          )}
          <ShellButton onPress={goToBook} style={styles.button}>
            <Text fontSize={fontSize} fontStyle='semiBold'>
              {t('Outline')}
            </Text>
          </ShellButton>
        </View>
      </ImageBackground>
    </ShellButton>
  )
}
