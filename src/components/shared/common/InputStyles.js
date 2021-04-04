import { ScaledSheet } from 'react-native-size-matters'
import Metrics from '../../../utils/Metrics'
import Fonts from '../../../fonts'
import Colors from '../../../utils/Colors'

const {
  white,
  textGray,
  textBlack,
  blackGray,
  inputWhite,
  inputBorderWhite,
  inputBorder
} = Colors
const { baseMargin, doubleBaseMargin, cornerRadius, IS_IOS } = Metrics
const { size, style } = Fonts

export default ScaledSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: inputBorder
  },
  input: {
    ...style.inputText,
    color: textGray,
    paddingVertical: IS_IOS ? 5 : null,
    fontSize: size.h4,
    flex: 1
  },
  multiline: {
    height: 'auto',
    paddingTop: baseMargin,
    maxHeight: '120@ms'
  },
  inputSmall: {
    fontSize: size.small
  },
  bordered: {
    borderColor: inputBorder,
    borderRadius: cornerRadius,
    borderWidth: 0.5,
    paddingVertical: baseMargin / 2,
    paddingHorizontal: doubleBaseMargin,
    backgroundColor: blackGray
  },
  friendly: {
    backgroundColor: inputWhite,
    borderColor: inputBorderWhite,
    borderRadius: cornerRadius * 1.75,
    borderWidth: 1
  },
  friendlyText: {
    textAlign: 'center',
    paddingVertical: baseMargin * 1.25,
    paddingHorizontal: doubleBaseMargin
  },
  center: {
    textAlign: 'center'
  },
  icon: {},
  darkMode: {
    color: 'white'
  },
  label: {
    paddingRight: baseMargin / 1.75,
    paddingVertical: baseMargin * 1.125
  },
  labelText: {
    ...style.semiBold,
    paddingBottom: 1
  },
  inset: {
    backgroundColor: white,
    borderColor: inputBorderWhite,
    borderRadius: cornerRadius,
    borderWidth: 1,
    paddingHorizontal: baseMargin
  },
  insetText: {
    paddingVertical: baseMargin * 1,
    paddingBottom: baseMargin * 1.2,
    color: textBlack
  },
  labelUp: {
    marginTop: 0,
    marginBottom: 0
  },
  labelDown: {
    marginTop: 26,
    marginBottom: -26
  }
})
