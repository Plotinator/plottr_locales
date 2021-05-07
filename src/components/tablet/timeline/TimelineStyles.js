import { ScaledSheet } from 'react-native-size-matters'
import Fonts from '../../../fonts'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import { LEFT_COLUMN_WIDTH } from '../../../utils/constants'

const { baseMargin, doubleBaseMargin, cornerRadius } = Metrics
const { size } = Fonts

export default ScaledSheet.create({
  container: {
    backgroundColor: 'hsl(210, 36%, 96%)',
    marginVertical: 2,
    marginBottom: 0,
    flex: 1
  }, // gray-9
  header: { flexDirection: 'row' },
  cornerCell: { width: LEFT_COLUMN_WIDTH },
  lineTitlesColumn: { position: 'absolute', width: LEFT_COLUMN_WIDTH },
  lineTitleCell: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    width: LEFT_COLUMN_WIDTH
  },
  lineTitle: {
    fontSize: 18
  },
  body: { marginLeft: LEFT_COLUMN_WIDTH },
  column: { flexDirection: 'column' },
  addCell: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  plusButton: {
    color: '#ff7f32'
  },
  table: {
    flex: 1,
    flexDirection: 'row'
  },
  row: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: doubleBaseMargin
  },
  last: {
    marginBottom: 0
  },
  input: {
    height: 60,
    flex: 1
  },
  colorSwatch: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: doubleBaseMargin,
    borderRadius: cornerRadius
  },
  pen: {
    color: 'white',
    fontSize: size.small
  },
  center: {
    alignItems: 'center'
  },
  ctaButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0
  },
  button: {
    width: '78%'
  },
  trashButton: {
    marginLeft: baseMargin
  },
  trash: {
    // fontSize: size.h5,
    width: '50%',
    color: Colors.lightGray
  }
})
