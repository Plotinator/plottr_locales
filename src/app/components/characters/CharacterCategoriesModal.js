import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import cx from 'classnames'
import * as CategoryActions from 'actions/categories'
import ItemsManagerModal, { ListItem } from 'components/dialogs/ItemsManagerModal'


function CharacterCategoriesModal({
  categories,
  ui: {
    darkMode,
  },
  closeDialog,
  addCharacterCategory,
  deleteCharacterCategory,
  updateCharacterCategory,
  reorderCharacterCategory,
}) {
  return (
    <ItemsManagerModal
      title={i18n('Character Categories')}
      subtitle={i18n('Choose what categories you want to put your characters into')}
      addLabel={i18n('Add category')}
      items={categories}
      darkMode={darkMode}
      closeDialog={closeDialog}
      onAdd={addCharacterCategory}
      renderItem={(item, index) => (
        <ListItem
          key={item.id}
          item={item}
          index={index}
          showType={false}
          canChageType={false}
          deleteItem={deleteCharacterCategory}
          updateItem={updateCharacterCategory}
          reorderItem={reorderCharacterCategory}
        />
      )}
    />
  )
}

function mapStateToProps (state) {
  return {
    categories: state.present.categories.characters,
    ui: state.present.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    ...bindActionCreators(CategoryActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterCategoriesModal)