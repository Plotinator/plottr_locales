import React, { useState, useEffect } from 'react'
import { t } from 'plottr_locales'
import { View, Left, Right, Icon, Badge, List, ListItem } from 'native-base'
import { StyleSheet } from 'react-native'
import { attachmentItemText } from '../../../utils/attachment_titles'
import { isTablet } from 'react-native-device-info'
import AttachmentSelector from '../../tablet/shared/AttachmentSelector'
import { Text, Input, Button } from '../../shared/common'
import Colors from '../../../utils/Colors'
import Metrics from '../../../utils/Metrics'

const defaultAttachments = ['characters', 'places', 'tags']

export default function AttachmentList (props) {
  const { item, itemType, navigate, only, books } = props
  const [attachments, setAttachments] = useState(only || defaultAttachments)

  useEffect(
    () => {
      if (books && !attachments.includes('bookIds')) {
        setAttachments(state => ['bookIds', ...state])
      }
    },
    [books]
  )

  const navigateToAttachmentSelector = type => {
    navigate('AttachmentSelectorModal', { item, itemType, type })
  }

  const renderAttachments = () => {
    if (isTablet()) {
      return attachments.map(type => (
        <AttachmentSelector
          key={type}
          type={type}
          item={item}
          itemType={itemType}
        />
      ))
    } else {
      return attachments.map(type => {
        return (
          <ListItem
            key={type}
            button
            onPress={() => navigateToAttachmentSelector(type)}>
            <Left style={styles.left}>
              <Badge info style={styles.badge}>
                <Text fontSize='h5' fontStyle='semiBold' white>
                  {item[type].length}
                </Text>
              </Badge>
              <Text fontStyle='semiBold'>{attachmentItemText(type)}</Text>
            </Left>
            <Right>
              <Icon type='FontAwesome5' name='chevron-right' />
            </Right>
          </ListItem>
        )
      })
    }
  }

  return (
    <View>
      <List>{renderAttachments()}</List>
    </View>
  )
}

const styles = StyleSheet.create({
  left: {
    alignItems: 'center'
  },
  badge: {
    minWidth: 27,
    alignItems: 'center',
    marginRight: 8
  }
})
