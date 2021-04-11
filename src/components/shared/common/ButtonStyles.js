import { ScaledSheet } from 'react-native-size-matters'
import Metrics from '../../../utils/Metrics'
import Fonts from '../../../fonts'
import Colors from '../../../utils/Colors'

const { baseMargin, doubleBaseMargin, buttonRadius } = Metrics
const { style } = Fonts
const { orange, white } = Colors

export default ScaledSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: buttonRadius,
    backgroundColor: orange
  },
  textWrapper: {
    paddingHorizontal: doubleBaseMargin,
    paddingVertical: baseMargin * 1.35
  },
  text: {
    ...style.buttonText,
    color: white
  },
  tightWrapper: {
    paddingHorizontal: baseMargin * 1.5,
    paddingVertical: baseMargin
  },
  bordered: {
    borderWidth: '1@ms',
    borderColor: 'lightgray'
  },
  faded: {
    opacity: 0.5
  },
  block: {
    width: '100%'
  }
})
