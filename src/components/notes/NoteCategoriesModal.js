import React, { useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'

import { selectors, actions } from 'wired-up-pltr'

import ItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'
import { PlottrComponentsContext } from '../../connections/pltrContext'

function NoteCategoriesModal({
  categories,
  closeDialog,
  addNoteCategory,
  deleteNoteCategory,
  updateNoteCategory,
  reorderNoteCategory,
}) {
  const {
    platform: {
      template: { startSaveAsTemplate },
    },
  } = useContext(PlottrComponentsContext)

  return (
    <ItemsManagerModal
      title={i18n('Note Categories')}
      subtitle={i18n('Choose what categories you want to put your notes into')}
      addLabel={i18n('Add category')}
      itemType={'notes'}
      items={categories}
      closeDialog={closeDialog}
      onAdd={addNoteCategory}
      renderItem={(item, index) => (
        <ListItem
          key={item.id}
          item={item}
          index={index}
          showType={false}
          canChageType={false}
          deleteItem={deleteNoteCategory}
          updateItem={updateNoteCategory}
          reorderItem={reorderNoteCategory}
        />
      )}
      startSaveAsTemplate={startSaveAsTemplate}
    />
  )
}

NoteCategoriesModal.propTypes = {
  categories: PropTypes.array.isRequired,
  closeDialog: PropTypes.func.isRequired,
  addNoteCategory: PropTypes.func.isRequired,
  deleteNoteCategory: PropTypes.func.isRequired,
  updateNoteCategory: PropTypes.func.isRequired,
  reorderNoteCategory: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
  return {
    categories: selectors.noteCategoriesSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    ...bindActionCreators(actions.category, dispatch),
  }
})(NoteCategoriesModal)
