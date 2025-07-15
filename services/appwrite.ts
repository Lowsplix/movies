import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVED_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!;
const IMAGES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_IMAGES_COLLECTION_ID!;
const FAVORITES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];

      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        count: 1,
        title: movie.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const saveMovie = async (movie: MovieDetails, userId: string) => {
  try {
    await database.createDocument(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      ID.unique(),
      {
        movie_id: movie.id,
        user_id: userId,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSavedMovies = async (
  userId: string
): Promise<Movie[] | undefined> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("user_id", userId), Query.orderDesc("$createdAt")]
    );

    return result.documents as unknown as Movie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const isMovieSaved = async (
  movieId: number,
  userId: string
): Promise<boolean> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("movie_id", movieId), Query.equal("user_id", userId)]
    );

    return result.documents.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const removeSavedMovie = async (movieId: number, userId: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("movie_id", movieId), Query.equal("user_id", userId)]
    );

    if (result.documents.length > 0) {
      const docId = result.documents[0].$id;
      await database.deleteDocument(DATABASE_ID, SAVED_COLLECTION_ID, docId);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const uploadUserImage = async (userImage: userImage) => {
  try {
    await database.createDocument(
      DATABASE_ID,
      IMAGES_COLLECTION_ID,
      ID.unique(),
      {
        id: userImage.id,
        profile_url: userImage.profile_url,
      }
    );
    console.log("uploaded: ", userImage.profile_url);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserImage = async (
  userId: string
): Promise<string | undefined> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      IMAGES_COLLECTION_ID,
      [Query.equal("id", userId)]
    );
    console.log("fetched: ", result.documents[0].profile_url);
    return result.documents[0].profile_url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addToFavorites = async (userId: string, movieId: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      [Query.equal("id", userId)]
    );

    if (result.documents.length === 0) {
      await database.createDocument(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        ID.unique(),
        {
          id: userId,
          favorites: [movieId],
        }
      );
    } else {
      await database.updateDocument(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        result.documents[0].$id,
        {
          favorites: [...result.documents[0].favorites, movieId],
        }
      );
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const isMovieFavorite = async (
  userId: string,
  movieId: number
): Promise<boolean> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      [Query.equal("id", userId)]
    );

    if (result.documents.length > 0) {
      return result.documents[0].favorites.includes(movieId.toString());
    }

    return false;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, movieId: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      [Query.equal("id", userId)]
    );

    if (result.documents.length > 0) {
      await database.updateDocument(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        result.documents[0].$id,
        {
          favorites: result.documents[0].favorites.filter(
            (id: string) => id !== movieId
          ),
        }
      );
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
