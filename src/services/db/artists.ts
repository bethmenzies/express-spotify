import Artist from './models/artist.ts';

export const findArtistsByWatchlist = async (watchlist: boolean) => {
  return await Artist.find({ watchlist: watchlist }, {}).sort({ name: 1 }).exec();
}

export const doesArtistExist = async (name: string, watchlist: boolean): Promise<any> => {
  return await Artist.findOne({ name: name, watchlist: watchlist })
        .collation({ locale: "en", strength: 2 })
        .exec();
}