import { ScaledSheet } from 'react-native-size-matters'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import Fonts from '../../../fonts'

const {
  baseMargin,
  doubleBaseMargin,
  section,
  cornerRadius,
  screenHeight,
  buttonRadius
} = Metrics
const { style, size } = Fonts
const {
  gray,
  white,
  orange,
  textGray,
  lightGray,
  textLightGray,
  lightenGray,
  cloudWhite,
  borderGray,
  textBlack,
  cloudGray
} = Colors

export default ScaledSheet.create({
  avoidingView: {
    flex: 1,
    backgroundColor: '#00000033',
    justifyContent: 'center',
    alignItems: 'center'
  },
  window: {
    backgroundColor: white,
    borderRadius: cornerRadius * 1.5,
    width: '80%',
    maxHeight: '75%',
    padding: doubleBaseMargin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,

  },
  closeButton: {
    backgroundColor: white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -baseMargin,
    right: -baseMargin,
    borderRadius: 50,
    width: '25@ms',
    height: '25@ms'
    // padding: baseMargin
  },
  closeIcon: {
    fontSize: size.tiny,
    color: orange
  },
  breadCrumbs: {
    backgroundColor: cloudWhite,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: borderGray,
    borderRadius: cornerRadius
  },
  crumb: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: baseMargin,
    paddingVertical: baseMargin,
    paddingRight: doubleBaseMargin,
    maxWidth: '50%'
  },
  chapterText: {
    ...style.bold,
    fontSize: size.small,
    color: textLightGray
  },
  crumbIcon: {
    fontSize: size.tiny,
    color: textLightGray,
    marginTop: 4,
    marginLeft: baseMargin / 2
  },
  divider: {
    width: 1.5,
    backgroundColor: borderGray,
    height: '100%',
    transform: [{ rotate: '15deg' }]
  },
  form: {},
  row: {
    paddingTop: baseMargin
  },
  labels: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: baseMargin / 2
  },
  label: {
    ...style.boldItalic,
    fontSize: size.small,
    color: lightenGray,
    paddingLeft: baseMargin / 4,
    paddingBottom: baseMargin / 2,
    marginRight: baseMargin / 2
  },
  count: {
    marginTop: -baseMargin / 2,
    backgroundColor: cloudGray,
    borderRadius: 50,
    width: '17@ms',
    height: '17@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  countText: {
    ...style.semiBold,
    fontSize: size.tiny,
    color: textLightGray
  },
  input: {
    height: '40@mvs'
  },
  inputText: {
    ...style.semiBold,
    color: textGray,
    paddingVertical: 0,
    paddingHorizontal: baseMargin / 2,
    fontSize: size.small
  },
  multiInput: {
    marginTop: 0
  },
  collapseButton: {
    flexDirection: 'row',
    position: 'absolute',
    right: baseMargin / 2,
    bottom: baseMargin / 2
  },
  collapseText: {
    ...style.italic,
    color: textGray,
    fontSize: size.nano
  },
  collapseIcon: {
    fontSize: size.small / 2,
    color: textGray,
    marginTop: 5,
    marginLeft: baseMargin / 4
  },
  collapsedIcon: {
    marginTop: 2,
    transform: [{ rotate: '-90deg' }]
  },
  actions: {
    justifyContent: 'center',
    paddingTop: doubleBaseMargin,
    flexDirection: 'row'
  },
  action: {
    borderRadius: cornerRadius,
    paddingHorizontal: doubleBaseMargin
  },
  menuPopover: {
    borderRadius: cornerRadius,
    paddingVertical: baseMargin
  },
  menuScroller: {
    maxHeight: '200@ms'
  },
  menuItem: {
    padding: baseMargin,
    paddingVertical: baseMargin / 2
  }
})
