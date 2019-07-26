export function query(str) {
  if (str) {
    let search = str.match(/\?.+/g)
    if (search && search[0]) {
      let splits = search[0].slice(1).split(/&|=/)
      let query = {}
      for (let i = 0; i < splits.length; i = i + 2) {
        query[splits[i]] = splits[i + 1]
      }
      return query
    }
  }
}
