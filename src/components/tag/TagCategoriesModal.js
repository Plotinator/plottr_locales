import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'

import { selectors, actions } from 'wired-up-pltr'

import ItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'

function TagCategoriesModal({
  categories,
  closeDialog,
  addTagCategory,
  deleteTagCategory,
  updateTagCategory,
  reorderTagCategory,
}) {
  return (
    <ItemsManagerModal
      title={i18n('Tag Categories')}
      subtitle={i18n('Choose what categories you want to put your tags into')}
      addLabel={i18n('Add category')}
      itemType={'tags'}
      items={categories}
      closeDialog={closeDialog}
      onAdd={addTagCategory}
      renderItem={(item, index) => (
        <ListItem
          key={item.id}
          item={item}
          index={index}
          showType={false}
          canChageType={false}
          deleteItem={deleteTagCategory}
          updateItem={updateTagCategory}
          reorderItem={reorderTagCategory}
        />
      )}
    />
  )
}

TagCategoriesModal.propTypes = {
  categories: PropTypes.array.isRequired,
  closeDialog: PropTypes.func.isRequired,
  addTagCategory: PropTypes.func.isRequired,
  deleteTagCategory: PropTypes.func.isRequired,
  updateTagCategory: PropTypes.func.isRequired,
  reorderTagCategory: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
  return {
    categories: selectors.tagCategoriesSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    ...bindActionCreators(actions.category, dispatch),
  }
})(TagCategoriesModal)
