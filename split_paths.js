const fs = require('fs');
const files = [
  'src/lib/templates/classic/ornate-grandeur/paths.ts',
  'src/lib/templates/classic/new-generation/paths.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const exportMatch = content.match(/export const (\w+) = \[/);
  if (!exportMatch) return;
  const varName = exportMatch[1];
  
  const strings = [];
  const matches = content.match(/\"([^\"]+)\"/g);
  if (!matches) return;
  
  matches.forEach(s => {
    const val = s.slice(1, -1);
    // Split by M and keep the M
    val.split('M').filter(Boolean).forEach(part => {
      strings.push('M' + part.trim());
    });
  });
  
  const newContent = `export const ${varName} = [\n  ${strings.map(s => `"${s}"`).join(',\n  ')}\n];\n`;
  fs.writeFileSync(file, newContent);
  console.log(`Updated ${file} with ${strings.length} segments`);
});
