import React, { useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'
import ItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'

import { selectors, actions } from 'wired-up-pltr'

import { PlottrComponentsContext } from '../../connections/pltrContext'

function PlaceCategoriesModal({
  categories,
  closeDialog,
  addPlaceCategory,
  deletePlaceCategory,
  updatePlaceCategory,
  reorderPlaceCategory,
}) {
  const {
    platform: {
      template: { startSaveAsTemplate },
    },
  } = useContext(PlottrComponentsContext)

  return (
    <ItemsManagerModal
      title={i18n('Place Categories')}
      subtitle={i18n('Choose what categories you want to put your places into')}
      addLabel={i18n('Add category')}
      itemType={'places'}
      items={categories}
      closeDialog={closeDialog}
      onAdd={addPlaceCategory}
      renderItem={(item, index) => (
        <ListItem
          key={item.id}
          item={item}
          index={index}
          showType={false}
          canChageType={false}
          deleteItem={deletePlaceCategory}
          updateItem={updatePlaceCategory}
          reorderItem={reorderPlaceCategory}
        />
      )}
      startSaveAsTemplate={startSaveAsTemplate}
    />
  )
}

PlaceCategoriesModal.propTypes = {
  categories: PropTypes.array.isRequired,
  closeDialog: PropTypes.func.isRequired,
  addPlaceCategory: PropTypes.func.isRequired,
  deletePlaceCategory: PropTypes.func.isRequired,
  updatePlaceCategory: PropTypes.func.isRequired,
  reorderPlaceCategory: PropTypes.func.isRequired,
  startSaveAsTemplate: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
  return {
    categories: selectors.placeCategoriesSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    ...bindActionCreators(actions.category, dispatch),
  }
})(PlaceCategoriesModal)
