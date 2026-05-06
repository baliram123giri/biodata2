import { StyleSheet } from '@react-pdf/renderer';

export const createRoyalStyles = (fontFamily: string) => StyleSheet.create({
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
    padding: 45,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    paddingBottom: 10,
    marginHorizontal: 40,
  },
  mantra: {
    fontSize: 14,
    color: '#800000',
    marginBottom: 5,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans Devanagari', // Keep Devanagari for Mantra
  },
  title: {
    fontSize: 24,
    color: '#800000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#800000',
    fontWeight: 'bold',
    padding: '4 10',
    marginBottom: 10,
    borderRadius: 4,
    borderLeft: '4pt solid #800000',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 6,
    lineHeight: 1.4,
    paddingLeft: 10,
  },
  label: {
    width: 130,
    fontSize: 11,
    color: '#555',
    fontWeight: 'bold',
  },
  colon: {
    width: 15,
    fontSize: 11,
    color: '#555',
  },
  value: {
    flex: 1,
    fontSize: 11,
    color: '#000',
  },
  logo: {
    width: 14,
    height: 14,
    marginRight: 5,
  }
});
