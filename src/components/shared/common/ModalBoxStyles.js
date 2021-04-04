import { ScaledSheet } from 'react-native-size-matters'
import Metrics from '../../../utils/Metrics'
import Fonts from '../../../fonts'
import Colors from '../../../utils/Colors'

const { borderGray, darkGray, textGray, white, orange, green, red } = Colors
const {
  section,
  baseMargin,
  buttonRadius,
  doubleBaseMargin,
  doubleSection,
  screenHeight,
  screenWidth
} = Metrics
const { size, style } = Fonts

export default ScaledSheet.create({
  shade: {
    position: 'absolute',
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dialogBox: {
    backgroundColor: white,
    borderRadius: buttonRadius,
    minHeight: 120,
    minWidth: 200,
    maxWidth: '90%',
    alignItems: 'center',
    height: 'auto',
    width: 'auto'
  },
  dialogTitle: {
    flexDirection: 'row',
    minHeight: 40,
    padding: baseMargin,
    paddingTop: baseMargin * 1.2,
    marginBottom: baseMargin / 2
  },
  titleText: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dialogBody: {
    paddingHorizontal: section,
    paddingBottom: section,
    alignItems: 'center'
  },
  closeButton: {
    padding: baseMargin * 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
    right: 0
  },
  closeIcon: {
    fontSize: size.h1,
    paddingBottom: 0,
    color: textGray
  }
})
