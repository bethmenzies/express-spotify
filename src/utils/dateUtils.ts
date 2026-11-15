export const getOldDate = () => {
  var date = new Date()
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  date.setFullYear(date.getFullYear() - 2)
  return date.toISOString().split('T')[0]
}

export const getTodaysDate = () => {
  var date = new Date()
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  return date.toISOString().split('T')[0]
}

export const now = () => {
  return Date.now()
}