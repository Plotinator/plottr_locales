import React, { useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'

import { selectors, actions } from 'wired-up-pltr'

import ItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'
import { PlottrComponentsContext } from '../../connections/pltrContext'

function CharacterCategoriesModal({
  categories,
  closeDialog,
  addCharacterCategory,
  deleteCharacterCategory,
  updateCharacterCategory,
  reorderCharacterCategory,
}) {
  const {
    platform: {
      template: { startSaveAsTemplate },
    },
  } = useContext(PlottrComponentsContext)

  return (
    <ItemsManagerModal
      title={i18n('Character Categories')}
      subtitle={i18n('Choose what categories you want to put your characters into')}
      addLabel={i18n('Add category')}
      itemType={'characters'}
      items={categories}
      closeDialog={closeDialog}
      onAdd={addCharacterCategory}
      renderItem={(item, index) => (
        <ListItem
          key={item.id}
          item={item}
          index={index}
          showType={false}
          canChageType={false}
          // The old API sucks :(
          deleteItem={(category) => deleteCharacterCategory(category.id)}
          updateItem={updateCharacterCategory}
          reorderItem={reorderCharacterCategory}
        />
      )}
      startSaveAsTemplate={startSaveAsTemplate}
    />
  )
}

CharacterCategoriesModal.propTypes = {
  categories: PropTypes.array.isRequired,
  closeDialog: PropTypes.func.isRequired,
  addCharacterCategory: PropTypes.func.isRequired,
  deleteCharacterCategory: PropTypes.func.isRequired,
  updateCharacterCategory: PropTypes.func.isRequired,
  reorderCharacterCategory: PropTypes.func.isRequired,
  startSaveAsTemplate: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
  return {
    categories: selectors.characterCategoriesSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    ...bindActionCreators(actions.category, dispatch),
  }
})(CharacterCategoriesModal)
