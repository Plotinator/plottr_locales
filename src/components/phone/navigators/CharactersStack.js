import React from 'react'
import { t } from 'plottr_locales'
import { createStackNavigator } from '@react-navigation/stack'
import CharactersHome from '../characters/CharactersHome'
import AddButton from '../../ui/AddButton'
import DrawerButton from '../../ui/DrawerButton'
import withBoundary from '../shared/BoundaryWrapper'
import CharacterDetails from '../characters/CharacterDetails'
import { RenderTitle } from '../../shared/common'

const Stack = createStackNavigator()
const CharacterDetailsBounded = withBoundary(CharacterDetails)

export default function CharactersStack (props) {
  const addCharacter = () => {
    props.navigation.push('CharacterDetails', { isNewCharacter: true })
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name='CharactersHome'
        component={CharactersHome}
        options={{
          title: RenderTitle('Characters'),
          headerRight: () => <AddButton onPress={addCharacter} />,
          headerLeft: () => (
            <DrawerButton openDrawer={props.route?.params?.openDrawer} />
          )
        }}
      />
      <Stack.Screen
        name='CharacterDetails'
        component={CharacterDetailsBounded}
        options={{ title: RenderTitle('Character Details') }}
      />
    </Stack.Navigator>
  )
}
