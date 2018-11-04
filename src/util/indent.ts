function fill (count: number): string {
  return Array.from({length: count}).fill(' ').join('')
}

export default function indent (string: string, level: number): string {
  return string
    .split('\n')
    .map(line => `${fill(level)}${line}`)
    .join('\n')
}