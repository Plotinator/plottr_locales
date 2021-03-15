import React, { useRef, useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Drawer } from 'native-base'
import { t } from 'plottr_locales'
import MainTabs from './MainTabs'
import CustomAttributesScreen from '../../shared/customAttributes/CustomAttributesScreen'
import { attachmentHeaderTitles } from '../../../utils/attachment_titles'
import SideBar from '../../shared/SideBar'
import PlotlinesStack from './PlotlinesStack'
import AttachmentSelectorModal from '../shared/AttachmentSelectorModal'
import ColorPickerScreen from '../shared/ColorPickerScreen'
import ErrorBoundary from '../../shared/ErrorBoundary'
import { RenderTitle } from '../../shared/common'

const RootStack = createStackNavigator()

export default function RootPhoneNavigator (props) {
  const drawerRef = useRef(null)
  const closeDrawer = () => drawerRef.current._root.close()
  const openDrawer = () => drawerRef.current._root.open()

  return (
    <ErrorBoundary>
      <Drawer
        ref={drawerRef}
        content={
          <SideBar
            closeFile={props.closeFile}
            closeDrawer={closeDrawer}
            logout={props.logout}
          />
        }
        onClose={closeDrawer}>
        <RootStack.Navigator mode='modal'>
          <RootStack.Screen
            name='Main'
            component={MainTabs}
            options={{ headerShown: false }}
            initialParams={{ openDrawer }}
          />
          <RootStack.Screen
            name='CustomAttributesModal'
            component={CustomAttributesScreen}
            options={{
              title: RenderTitle('Custom Attributes'),
              headerBackTitle: RenderTitle('Done')
            }}
          />
          <RootStack.Screen
            name='AttachmentSelectorModal'
            component={AttachmentSelectorModal}
            options={({ route }) => ({
              title: attachmentHeaderTitles(route.params.type),
              headerBackTitle: RenderTitle('Done')
            })}
          />
          <RootStack.Screen
            name='PlotlinesModal'
            component={PlotlinesStack}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name='ColorPickerModal'
            component={ColorPickerScreen}
            options={{
              title: RenderTitle('Color Picker'),
              headerBackTitle: RenderTitle('Back')
            }}
          />
        </RootStack.Navigator>
      </Drawer>
    </ErrorBoundary>
  )
}
