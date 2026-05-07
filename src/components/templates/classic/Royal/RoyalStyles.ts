import { StyleSheet } from '@react-pdf/renderer';

export const createRoyalStyles = (fontFamily: string, theme?: any) => {
  const primaryColor = theme?.primaryColor || '#800000';
  const secondaryColor = theme?.secondaryColor || '#333333';
  const baseFontSize = theme?.fontSize || 11;
  const padding = theme?.padding !== undefined ? theme.padding : 45;

  return StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: fontFamily,
    backgroundColor: '#FFFFFF',
    height: "100%"
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: -2,
  },
  container: {
    position: 'relative',
    height: '100%',
    width: '100%',
    padding: padding,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    paddingBottom: 10,
    marginHorizontal: 40,
  },
  mantra: {
    fontSize: 14,
    color: primaryColor,
    marginBottom: 5,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans Devanagari', // Keep Devanagari for Mantra
  },
  title: {
    fontSize: baseFontSize * 2.2,
    color: primaryColor,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: baseFontSize * 1.4,
    color: primaryColor,
    fontWeight: 'bold',
    padding: '4 10',
    marginBottom: 10,
    borderRadius: 4,
    borderLeft: `4pt solid ${primaryColor}`,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 6,
    lineHeight: 1.4,
    paddingLeft: 10,
  },
  label: {
    width: 130,
    fontSize: baseFontSize,
    color: secondaryColor,
    fontWeight: 'bold',
  },
  colon: {
    width: 15,
    fontSize: baseFontSize,
    color: secondaryColor,
  },
  value: {
    flex: 1,
    fontSize: baseFontSize,
    color: '#000',
  },
  logo: {
    width: 14,
    height: 14,
    marginRight: 5,
  }
});
};
