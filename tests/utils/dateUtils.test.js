const { getOldDate, getTodaysDate } = require('../../src/utils/dateUtils');

describe('getOldDate', () => {
  it('returns the date exactly 2 years ago from today', () => {
    const today = new Date();
    let day
    if (today.getDate() < 10) {
      day = `0${today.getDate()}`
    } else {
      day = today.getDate()
    }
    const expectedString = `${today.getFullYear() - 2}-${today.getMonth() + 1}-${day}`;
    const result = getOldDate();
    expect(result).toEqual(expectedString);
  })
})
describe(getTodaysDate, () => {
  it('returns todays date in YYYY-MM-DD format', () => {
    const today = new Date();
    let day
    if (today.getDate() < 10) {
      day = `0${today.getDate()}`
    } else {
      day = today.getDate()
    }
    const expectedString = `${today.getFullYear()}-${today.getMonth() + 1}-${day}`;
    const result = getTodaysDate();
    expect(result).toEqual(expectedString);
  })
})