import { ScaledSheet } from 'react-native-size-matters'
import Fonts from '../../../fonts'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'

const { baseMargin, cornerRadius } = Metrics
const { style, size } = Fonts
const { orange, white, textGray, cloudWhite, borderGray, textBlack } = Colors

export default ScaledSheet.create({
  tabsBase: {
    backgroundColor: cloudWhite,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: borderGray,
    borderRadius: cornerRadius * 1.25,
    padding: baseMargin / 3,
    paddingRight: '23@ms',
    minHeight: '35@ms'
  },
  tabCell: {
    borderWidth: 1,
    borderColor: borderGray,
    borderRadius: cornerRadius,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: baseMargin / 4,
    margin: baseMargin / 3
  },
  tabName: {
    ...style.semiBoldItalic,
    fontSize: size.small,
    color: textGray,
    paddingLeft: baseMargin / 1.25
  },
  whiteName: {
    color: white
  },
  removeButton: {
    padding: baseMargin / 1.5
  },
  removeIcon: {
    fontSize: size.micro,
    color: textBlack,
    opacity: 0.25
  },
  addButton: {
    width: '23@ms',
    height: '23@ms',
    position: 'absolute',
    top: baseMargin / 1.5,
    right: baseMargin / 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: orange
  },
  addIcon: {
    fontSize: size.micro,
    color: orange
  },
  menuPopover: {
    borderRadius: cornerRadius
    // paddingVertical: baseMargin / 2
  },
  menuScroller: {
    maxHeight: '200@ms'
  },
  menuItem: {
    padding: baseMargin,
    paddingVertical: baseMargin / 2,
    borderBottomWidth: 1,
    borderBottomColor: borderGray,
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuDot: {
    backgroundColor: white,
    width: '10@ms',
    height: '10@ms',
    marginLeft: baseMargin / 2,
    borderRadius: 50,
    marginTop: baseMargin / 4
  }
})
